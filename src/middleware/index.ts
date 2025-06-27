import compose from 'koa-compose';
import { ErrorCode, genError } from '../common/Error';
import type { RouteContext } from '../core';
import type {
  Middleware,
  MiddlewareConfig,
  MiddlewareGen,
  MiddlewareNext,
  BaseMiddlewareOption,
} from './types';
import DefaultFetch from './DefaultFetch';
import ErrorFallback from './ErrorFallback';

const DEFAULT_FETCH_MIDDLE_NAME = 'DefaultFetch';
// const XUEXIAO_MIDDLEWARE_NAME = 'XueXiao';

// 仅用于单测，添加测试中间件
// export function _addMiddleware(name: string, middlewareGen: MiddlewareGen) {
//   if (!MIDDLEWARE_MAP.has(name)) {
//     MIDDLEWARE_MAP.set(name, middlewareGen);
//   }
// }

export class MiddlewareManager {
  #middlewares: MiddlewareConfig[];
  #presetMiddlewares: Map<string, MiddlewareGen<BaseMiddlewareOption>>;

  constructor(data: { middlewares?: [string, MiddlewareGen<BaseMiddlewareOption>][] }) {
    this.#middlewares = [];
    this.#presetMiddlewares = new Map<string, MiddlewareGen<BaseMiddlewareOption>>([
      [ DEFAULT_FETCH_MIDDLE_NAME, DefaultFetch as MiddlewareGen<BaseMiddlewareOption> ],
      [ 'ErrorFallback', ErrorFallback as MiddlewareGen<BaseMiddlewareOption> ],
      ...(data.middlewares ?? []),
    ]);
    // 添加默认中间件
  }

  get middlewares() {
    return this.#middlewares;
  }

  async load(config: MiddlewareConfig) {
    const [ name, opt ] = config;
    const mwGen = this.#presetMiddlewares.get(name);
    if (!mwGen) {
      throw genError(ErrorCode.RequestMiddlewareNotFoundError, {
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
      throw genError(ErrorCode.RequestMiddlewareNotFoundError, {
        summary: name,
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
    // let existXuexiaoMiddleware = false;
    for (const config of middlewareConfigs) {
      const name = config[0];
      if (name === DEFAULT_FETCH_MIDDLE_NAME) {
        // DefaultFetch 始终放在最后
        defaultFetchMiddlewareConfig = config;
        continue;
      }
      // if (name === XUEXIAO_MIDDLEWARE_NAME) {
      //   existXuexiaoMiddleware = true;
      // }
      const middleware = await this.load(config);
      if (middleware) {
        middlewares.push(middleware);
      }
    }
    // 可以根据 host 动态添加中间件
    // if (ctx.host === 'example.com' && !existSpecialMiddleware) {
    //   const specialMiddleware = await loadMiddleware([
    //     SPECIAL_MIDDLEWARE_NAME,
    //     { config: 'value' }
    //   ]);
    //   middlewares.unshift(specialMiddleware!);
    // }
    // DefaultFetch 始终存在，做了兼容保证在 SSR 这种独立请求的中间件存在时不存重复发请求
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
