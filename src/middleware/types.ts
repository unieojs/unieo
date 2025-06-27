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

export type Middleware<T extends RouteContext = RouteContext> = (ctx: T, next: MiddlewareNext) => Promise<void>;
export type MiddlewareGen<T extends BaseMiddlewareOption = BaseMiddlewareOption> = (opt: T) => Middleware<any>;
