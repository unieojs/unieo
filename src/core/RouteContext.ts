import { UrlValueType } from '../common/Enum';
import { parse } from 'cookie';
import { getSuffix } from '../util/Url';
import { BaseError, ErrorCode, genError } from '../common/Error';
import { RENDER_ROUTE_ERROR_HEADER } from '../common/constants';
import { encodeErrorMessage } from '../util/LogUtil';
import { MiddlewareManager } from '../middleware';
import type { ERRequestInit, HttpClient, ILogger, RouteHelper } from '../types';
import type { ERPerformance } from './ERPerformance';
import type { MiddlewareConfig, MiddlewareGen } from '../middleware/types';

export interface RouteContextRawData {
  mainContext?: boolean;
  request: Request;
  helper: RouteHelper;
  event: FetchEvent;
  performance: ERPerformance;
  presetMiddlewares?: [string, MiddlewareGen][];
}

export class RouteContext {
  public logger: ILogger;
  public readonly middlewareManager: MiddlewareManager;
  public readonly performance: ERPerformance;
  public readonly event: FetchEvent;
  public httpClient: HttpClient;
  readonly #errors: BaseError[];
  readonly #originRequest: Request;
  readonly #originRequestUrl: URL;
  #request: Request;
  #response?: Response;
  #requestUrl: URL;
  #requestUrlWithoutParams: string;
  #requestInit: ERRequestInit;

  constructor(data: RouteContextRawData) {
    this.event = data.event;
    this.performance = data.performance;
    this.httpClient = data.helper.httpClient;
    this.logger = data.helper.logger;
    this.middlewareManager = new MiddlewareManager({
      presetMiddlewares: data.presetMiddlewares,
    });
    this.#request = data.request;
    this.#requestUrl = new URL(this.#request.url);
    this.#requestUrlWithoutParams = `${this.#requestUrl.origin}${this.#requestUrl.pathname}`;
    this.#originRequest = data.request.clone();
    this.#originRequestUrl = new URL(this.#originRequest.url);
    this.#requestInit = {};
    this.#errors = [];
  }

  waitUntil(fn: Promise<void>) {
    return this.event.waitUntil(fn);
  }

  get request() {
    return this.#request;
  }

  get response() {
    return this.#response;
  }

  get originRequest() {
    return this.#originRequest;
  }

  get requestUrl() {
    return this.#requestUrl;
  }

  get originRequestUrl() {
    return this.#originRequestUrl;
  }

  get protocol() {
    return this.#requestUrl.protocol;
  }

  get host() {
    return this.#requestUrl.host;
  }

  get origin() {
    return this.#requestUrl.origin;
  }

  get path() {
    return this.#requestUrl.pathname;
  }

  get href() {
    return this.#requestUrl.href;
  }

  get search(): string {
    return this.#requestUrl.search;
  }

  get urlWithoutParams() {
    return this.#requestUrlWithoutParams;
  }

  get requestInit() {
    return this.#requestInit;
  }

  set requestInit(value: ERRequestInit) {
    this.#requestInit = value;
  }

  setRequest(request: Request) {
    if (request) {
      this.#request = request;
      this.#requestUrl = new URL(request.url);
      this.#requestUrlWithoutParams = `${this.#requestUrl.origin}${this.#requestUrl.pathname}`;
    }
  }

  setResponse(response: Response) {
    if (response) {
      this.#response = response;
    }
  }

  getRequestHeaderValue(name: string): string | null {
    return this.request.headers.get(name);
  }

  getResponseHeaderValue(name: string): string | null {
    return this.response?.headers.get(name) ?? null;
  }

  getCookieValue(name: string): string | null {
    const cookieStr = this.request.headers.get('cookie');
    if (!cookieStr) {
      return null;
    }
    const res = parse(cookieStr);
    return res[name] || null;
  }

  getUrlValue(urlType: UrlValueType): string | null {
    switch (urlType) {
      case UrlValueType.HOST:
        return this.host;
      case UrlValueType.PATH:
        return this.path;
      case UrlValueType.HREF:
        return this.urlWithoutParams;
      case UrlValueType.SUFFIX:
        return getSuffix(this.path, this.host);
      default:
        return null;
    }
  }

  getOriginUrlValue(urlType: UrlValueType): string | null {
    switch (urlType) {
      case UrlValueType.HOST:
        return this.originRequestUrl.host;
      case UrlValueType.PATH:
        return this.originRequestUrl.pathname;
      default:
        return null;
    }
  }

  getQueryValue(name: string): string | null {
    return this.#requestUrl.searchParams.get(name);
  }

  async fallback(): Promise<Response> {
    return this.httpClient.request(this.originRequest, {
      unioFallback: true,
    });
  }

  logError(error: BaseError | Error) {
    let formatError: BaseError;
    if (!BaseError.isBaseError(error)) {
      formatError = genError(ErrorCode.SystemError, {
        name: error.name,
        message: encodeErrorMessage(error.message),
        stack: encodeErrorMessage(error.stack),
      });
    } else {
      formatError = error;
    }
    this.#errors.push(formatError);
    // Error Stack 里本身包含了 name 和 message，这里只补充打印 code 跟 details 就行
    const stackErrorMsg = `${formatError.code} ${formatError.details ?? ''}\n${formatError.stack}`;
    this.logger.error(stackErrorMsg);
  }

  appendExtInfoToResponse(res: Response): Response {
    const newResponse = new Response(res.body, res);

    if (this.#errors.length === 0) {
      return newResponse;
    }
    // append error Info
    const errorCodeArr: string[] = [];
    for (const error of this.#errors) {
      errorCodeArr.push(error.toShownString());
    }
    newResponse.headers.set(RENDER_ROUTE_ERROR_HEADER, errorCodeArr.join('|') || '-');

    return newResponse;
  }

  setMiddlewares(value: MiddlewareConfig[]) {
    this.middlewareManager.set(value);
  }

  addMiddleware(middleware: MiddlewareConfig) {
    this.middlewareManager.add(middleware);
  }

  clearMiddleware() {
    void this.middlewareManager.clear();
  }

  get middlewares() {
    return this.middlewareManager.middlewares;
  }

  async runMiddleware() {
    return this.middlewareManager.run(this);
  }
}
