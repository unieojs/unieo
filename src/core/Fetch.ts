import { DecompressType, HttpMethod } from '../common/Enum';
import { ErrorCode, genError } from '../common/Error';
import type { ERRequestInit, HttpClient } from '../types';

const DEFAULT_REQUEST_INIT: ERRequestInit = {
  cdnProxy: true,
  // 两个 case:
  // 1. 请求头带了 if-none-match 的命中缓存会返回 304
  // 2. HEAD 请求默认的 decompress 解压会导致 ER 直接出错，所以直接改成 manual 不解压
  decompress: DecompressType.MANUAL,
};

// Clear cookie for specific hosts when needed
const CLEAR_COOKIE_HOST = [
  'example-render1.com',
  'example-render2.com',
  'example-render3.com',
];

export class ERHttpClient implements HttpClient {
  /**
   * 默认请求
   * 显式透传参数，某些边缘计算环境存在 fetch / request 部分属性不支持，这里直接透传 method、headers、body、redirect
   */
  async request(requestInstance: Request, options?: ERRequestInit, standard?: boolean): Promise<Response> {
    const { method, headers, body, redirect } = requestInstance;
    const cdnProxy = options?.cdnProxy ?? DEFAULT_REQUEST_INIT.cdnProxy;
    const decompress = options?.decompress ?? DEFAULT_REQUEST_INIT.decompress;
    const unioFallback = options?.unioFallback ?? false;
    const requestInit: ERRequestInit = {
      cdnProxy,
      decompress,
      method,
      headers,
      redirect,
      unioFallback,
    };
    const urlObj = new URL(requestInstance.url);

    /*  header 处理 */
    const newHeaders = new Headers(headers);
    if (CLEAR_COOKIE_HOST.includes(urlObj.host)) {
      newHeaders.delete('cookie');
    }
    // 可以根据需要设置认证头
    // newHeaders.set('x-custom-auth', 'your-auth-token');
    requestInit.headers = newHeaders;
    /*  header 处理结束 */

    if (
      ![ HttpMethod.CONNECT, HttpMethod.GET, HttpMethod.HEAD, HttpMethod.OPTIONS, HttpMethod.TRACE ].includes(
        method as HttpMethod,
      )
    ) {
      requestInit.body = body;
    }
    if (!options?.timeout) {
      return fetch(requestInstance, requestInit);
    }
    const timeout = options.timeout;
    // Create a custom timeout promise.
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          genError(ErrorCode.TimeoutError, {
            message: `Request timeout after ${timeout}ms, url: ${requestInstance.url}`,
          }),
        );
      }, timeout);
    });
    try {
      return await Promise.race([ fetch(requestInstance, requestInit), timeoutPromise as Promise<Response> ]);
    } catch (error) {
      // 超时直接抛出错误更符合 fetch 标准，为了兼容存量代码这里还是通过配置开启
      if (standard) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(`Error: ${errorMessage}`, { status: 408 });
    }
  }
}
