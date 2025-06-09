import type { DecompressType } from './common/Enum';
import type { RouteContext } from './core';

interface ERRequestInit extends RequestInit {
  cdnProxy?: boolean;
  decompress?: DecompressType;
  timeout?: number;
  // 是否完整走一遍 route 链路
  routeExecute?: boolean;
  routeContext?: RouteContext;
  // 标识 unio fallback ，方便在 unio-er-runtime 判断
  unioFallback?: boolean;
}

export interface ERFetchEvent extends FetchEvent {
  info: ERInfo;
}

export interface ILogger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

export interface HttpClient {
  request: (request: Request, options?: ERRequestInit, standard?: boolean) => Promise<Response>;
}

export interface RouteHelper {
  logger: ILogger;
  httpClient: HttpClient;
}
