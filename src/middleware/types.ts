import type { RouteContext, ValueRawData } from '../core';
import type { RawMatch } from '../core';

export type BaseMiddlewareOption = Record<string, unknown>;

export interface RawMiddlewareConfig {
  match?: RawMatch;
  option?: Record<string, ValueRawData>;
}

export type RawMiddleware = [string, RawMiddlewareConfig] | string;

export type MiddlewareConfig = [string, BaseMiddlewareOption];

export type MiddlewareNext = () => Promise<void>;

export type Middleware = (ctx: RouteContext, next: MiddlewareNext) => Promise<void>;
export type MiddlewareGen<T extends BaseMiddlewareOption = BaseMiddlewareOption> = (opt: T) => Middleware;
