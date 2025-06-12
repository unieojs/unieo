import { isNil, isObject, isString } from 'lodash';
import { RequestInitValueType, RequestRewriteType, RewriteOperation, UrlValueType } from '../common/Enum';
import { Value } from './Value';
import { Match } from './Match';
import { rewritePath, rewriteUrl } from '../util/PathRegexp';
import type { ValueRawData } from './Value';
import type { RouteContext } from './RouteContext';
import { appendSearchParams, isValidUrl } from '../util/Url';
import type { BaseMiddlewareOption, MiddlewareConfig, RawMiddleware } from '../middleware/types';
import pMap from 'p-map';
import type { RawMatch } from './Match';
import { filterUndefined } from '../util/Array';
import { appendHeader, getReqHeaderObj } from '../util/Header';
import type { PathRegexpConfig } from '../util/PathRegexp';
import type { BaseProcessor } from './new_processor/processor/BaseProcessor';

export interface RawRequestRewrite {
  // 覆写类型
  type: RequestRewriteType;
  // 匹配字段
  field: string;
  // 覆写值
  value?: ValueRawData;
  // 操作
  operation: RewriteOperation;
  // match 配置，做更精细的匹配
  match?: RawMatch;
}

export class RequestRewrite {
  type: RequestRewriteType;
  field: string;
  value: Value | null;
  operation: RewriteOperation;
  processor: BaseProcessor;
  match?: Match;

  constructor(raw: RawRequestRewrite, processor: BaseProcessor) {
    this.type = raw.type;
    this.field = raw.field;
    this.value = raw.value ? new Value(raw.value, processor) : null;
    this.operation = raw.operation;
    this.processor = processor;
    this.match = raw.match ? new Match(raw.match, this.processor) : undefined;
  }

  async rewrite(request: Request, ctx: RouteContext): Promise<Request> {
    const extraMatch = this.match ? await this.match.match(ctx, this.processor.logger) : true;
    if (!extraMatch) {
      return request;
    }

    const value = this.value ? await this.value.get(ctx) : null;
    switch (this.type) {
      case RequestRewriteType.URL:
        request = this.rewriteUrl(ctx, request, value as string | null);
        break;
      case RequestRewriteType.QUERY:
        request = this.rewriteQuery(request, value as string | null);
        break;
      case RequestRewriteType.HEADER:
        request = this.rewriteHeader(request, value as string | null);
        break;
      case RequestRewriteType.REQUEST_INIT:
        this.rewriteRequestInit(ctx, value);
        break;
      case RequestRewriteType.MIDDLEWARE:
        await this.rewriteMiddleware(ctx, value as RawMiddleware[] | null);
        break;
      default:
        break;
    }
    return request;
  }

  private rewriteUrl(_: RouteContext, request: Request, value: string | null): Request {
    const url = new URL(request.url);
    switch (this.operation) {
      // url 只支持 SET
      case RewriteOperation.SET:
        if (!isNil(value)) {
          if (isString(value)) {
            if (this.field === (UrlValueType.HREF as string) && isValidUrl(value)) {
              url.href = appendSearchParams(value, new URLSearchParams(url.search));
            } else if (this.field === (UrlValueType.PATH as string)) {
              url.pathname = value;
            } else if (this.field === (UrlValueType.HOST as string)) {
              url.host = value;
            }
          } else if (isObject(value)) {
            if (this.field === (UrlValueType.HREF as string)) {
              url.href = rewriteUrl(url, value as PathRegexpConfig);
            } else if (this.field === (UrlValueType.PATH as string)) {
              url.pathname = rewritePath(url.pathname, value as PathRegexpConfig);
            }
          }
        }
        break;
      default:
        break;
    }
    // 某些 runtime 不支持 URL 作为第一个参数，这里统一使用 string
    // url 一旦改变，需要重新创建 request，不再基于原始的 request
    return new Request(url.toString(), {
      method: request.method,
      headers: getReqHeaderObj(request.headers),
      redirect: request.redirect,
      body: request.body,
    });
  }

  private rewriteQuery(request: Request, value: string | null): Request {
    const url = new URL(request.url);
    switch (this.operation) {
      case RewriteOperation.SET:
        if (!isNil(value) && isString(value)) {
          url.searchParams.set(this.field, value);
        }
        break;
      case RewriteOperation.DELETE:
        url.searchParams.delete(this.field);
        break;
      case RewriteOperation.APPEND:
        if (!isNil(value) && isString(value)) {
          url.searchParams.append(this.field, value);
        }
        break;
      default:
        break;
    }
    // 某些 runtime 不支持 URL 作为第一个参数，这里统一使用 string
    return new Request(url.toString(), new Request(request));
  }

  private rewriteHeader(request: Request, value: string | null): Request {
    const headers = request.headers;
    switch (this.operation) {
      case RewriteOperation.SET:
        if (!isNil(value) && isString(value)) {
          headers.set(this.field, value);
        }
        break;
      case RewriteOperation.DELETE:
        headers.delete(this.field);
        break;
      case RewriteOperation.APPEND:
        if (!isNil(value) && isString(value)) {
          appendHeader(headers, this.field, value);
        }
        break;
      default:
        break;
    }
    return request;
  }

  private rewriteRequestInit(ctx: RouteContext, value: unknown) {
    const requestInit = ctx.requestInit;
    switch (this.operation) {
      case RewriteOperation.SET: {
        switch (this.field as RequestInitValueType) {
          case RequestInitValueType.CDN_PROXY:
            requestInit.cdnProxy = value !== false;
            break;
          default:
            break;
        }
        break;
      }
      default:
        break;
    }
  }

  private async rewriteMiddleware(ctx: RouteContext, value: RawMiddleware[] | null) {
    switch (this.operation) {
      case RewriteOperation.SET: {
        const middlewares = await pMap(value ?? [], async item => {
          return this.parseMiddlewareConfig(ctx, item);
        }, { concurrency: 5 });
        ctx.setMiddlewares(filterUndefined(middlewares));
        break;
      }
      case RewriteOperation.APPEND: {
        await pMap(value ?? [], async item => {
          const middleware = await this.parseMiddlewareConfig(ctx, item);
          if (middleware) {
            ctx.addMiddleware(middleware);
          }
        }, { concurrency: 5 });
        break;
      }
      case RewriteOperation.DELETE: {
        ctx.clearMiddleware();
        break;
      }
      default:
        break;
    }
  }

  private async parseMiddlewareConfig(ctx: RouteContext, config: RawMiddleware): Promise<MiddlewareConfig | null> {
    if (isString(config)) {
      config = [ config, {} ];
    }
    const [ name, rawData ] = config;
    if (rawData?.match) {
      const match = new Match(rawData.match, this.processor);
      const isMatch = await match.match(ctx, this.processor.logger);
      if (!isMatch) {
        return null;
      }
    }
    const data: BaseMiddlewareOption = {};
    for (const key in rawData?.option ?? {}) {
      const rawValue = rawData.option?.[key];
      if (!isNil(rawValue)) {
        const value = new Value(rawValue, this.processor);
        data[key] = await value.get(ctx);
      }
    }
    return [ name, data ];
  }
}
