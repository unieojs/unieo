import compose from 'koa-compose';
import { ErrorCode, genError } from '../common/Error';
import type { RouteContext } from '../core';
import type { BaseMiddlewareOption, Middleware, MiddlewareConfig, MiddlewareGen, MiddlewareNext } from './types';
import DefaultFetch from './DefaultFetch';
import ErrorFallback from './ErrorFallback';

const DEFAULT_FETCH_MIDDLE_NAME = 'DefaultFetch';

export class MiddlewareManager {
  #middlewares: MiddlewareConfig[];
  #presetMiddlewares: Map<string, MiddlewareGen>;

  constructor(data: { middlewares?: [string, MiddlewareGen][] }) {
    this.#middlewares = [];
    this.#presetMiddlewares = new Map<string, MiddlewareGen>([
      [ DEFAULT_FETCH_MIDDLE_NAME, DefaultFetch as MiddlewareGen ],
      [ 'ErrorFallback', ErrorFallback as MiddlewareGen ],
      ...(data.middlewares ?? []),
    ]);
  }

  get middlewares() {
    return this.#middlewares;
  }

  async load(config: MiddlewareConfig) {
    const [ name, opt ] = config;
    const mwGen = this.#presetMiddlewares.get(name);
    if (!mwGen) {
      throw genError(ErrorCode.LoadMiddlewareNotFoundError, {
        summary: name,
      });
    }
    const mw = mwGen(opt);
    return (ctx: RouteContext, next: MiddlewareNext) => {
      return mw(ctx, next);
    };
  }

  // 设置中间件
  set(middlewares: MiddlewareConfig[]) {
    middlewares.forEach(middleware => this.add(middleware));
  }

  // 添加中间件，支持去重
  add(middleware: MiddlewareConfig) {
    // 校验 middleware 是否存在
    const name = middleware[0];
    if (!this.#presetMiddlewares.has(name)) {
      throw genError(ErrorCode.LoadMiddlewareNotFoundError, {
        summary: name,
        message: 'Middleware not found: ' + name,
      });
    }
    const existMiddlewareIndex = this.#middlewares.findIndex(item => item[0] === name);
    if (existMiddlewareIndex >= 0) {
      // 移除已存在的中间件
      this.#middlewares.splice(existMiddlewareIndex, 1, middleware);
    }
    this.#middlewares.push(middleware);
  }

  async run(ctx: RouteContext) {
    const { middlewares: middlewareConfigs = [] } = this;
    const middlewares: Middleware[] = [];

    let defaultFetchMiddlewareConfig: MiddlewareConfig = [ DEFAULT_FETCH_MIDDLE_NAME, {} ];
    for (const config of middlewareConfigs) {
      const name = config[0];
      if (name === DEFAULT_FETCH_MIDDLE_NAME) {
        // DefaultFetch 始终放在最后
        defaultFetchMiddlewareConfig = config;
        continue;
      }
      const middleware = await this.load(config);
      if (middleware) {
        middlewares.push(middleware);
      }
    }
    // DefaultFetch 始终存在
    const defaultFetchMiddleware = await this.load(defaultFetchMiddlewareConfig);
    middlewares.push(defaultFetchMiddleware);
    const fn = compose(middlewares);
    await fn(ctx);
  }

  async clear() {
    this.#middlewares = [];
  }
}

export type {
  Middleware,
  MiddlewareConfig,
  MiddlewareGen,
  MiddlewareNext,
  BaseMiddlewareOption,
  RawMiddleware,
} from './types';
