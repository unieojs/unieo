import { isString } from 'lodash';

export const HTTP_PROTOCOL = [ 'https:', 'http:' ];
export const ALIPAY_SCHEMA_PROTOCOL = [ 'alipays:', 'afwealth:' ];

export const AVAIL_PROTOCOL = [ ...HTTP_PROTOCOL, ...ALIPAY_SCHEMA_PROTOCOL ];

export const FAKE_ORIGIN = 'https://render-route-er.com';

export function isValidUrl(urlStr: string): boolean {
  let url;
  try {
    url = new URL(urlStr);
  } catch (err) {
    // URL parsing failed for non-standard protocols, log error and return false
    console.error('URL parsing failed:', err);
    // 某些边缘计算环境的 URL 实现只支持 http/https，其他协议会报错
    return ALIPAY_SCHEMA_PROTOCOL.some(item => urlStr.startsWith(item));
  }
  return AVAIL_PROTOCOL.includes(url.protocol);
}

export function getProtocol(urlStr: string): string {
  return urlStr.split(':')[0] + ':';
}

export function getPath(urlStr: string, defaultHost: string): string {
  return new URL(urlStr, `https://${defaultHost}`).pathname;
}

export function getHost(urlStr: string, defaultHost: string): string {
  if (isValidUrl(urlStr)) {
    return new URL(urlStr).host;
  }
  return defaultHost;
}

export function getSearch(urlStr: string, defaultHost: string): string {
  const url = new URL(urlStr, `https://${defaultHost}`);
  return url.search;
}

export function getSuffix(urlStr: string, host: string): string {
  const path = getPath(urlStr, host);
  const lastSubPath = path.split('/').pop() ?? '';
  if (!lastSubPath.includes('.')) {
    return 'html';
  }
  const suffix = lastSubPath.split('.').pop() ?? '';
  return suffix.toLowerCase();
}

export function getUrlWithoutParams(urlStr: string): string {
  if (isValidUrl(urlStr)) {
    const url = new URL(urlStr);
    return `${url.origin}${url.pathname}`;
  }
  return urlStr;
}

interface AppendSearchParamsOpts {
  isAlipaySchema?: boolean;
}

export function appendSearchParams(url: string | URL, searchParams: URLSearchParams, opts?: AppendSearchParamsOpts) {
  const urlObj = isString(url) ? new URL(url) : url;
  const originSearchParams = urlObj.searchParams;
  // 对于特定 schema，需要将参数传递到 page 或 url 参数中
  if (opts?.isAlipaySchema) {
    let pageParam = originSearchParams.get('page');
    let urlParam = originSearchParams.get('url');
    if (pageParam) {
      // append searchParams to page
      pageParam = appendSearchParamToAlipaySchemaPage(pageParam, searchParams);
      originSearchParams.set('page', pageParam);
    } else if (urlParam) {
      // append searchParams to url
      urlParam = appendSearchParamToAlipaySchemaPage(urlParam, searchParams);
      originSearchParams.set('url', urlParam);
    }
    return urlObj.href;
  }
  for (const [ key, value ] of searchParams.entries()) {
    originSearchParams.append(key, value);
  }
  return urlObj.href;
}

export function appendSearchParamToAlipaySchemaPage(url: string, searchParams: URLSearchParams) {
  const urlObj = new URL(url, FAKE_ORIGIN);
  const originSearchParams = urlObj.searchParams;
  for (const [ key, value ] of searchParams.entries()) {
    originSearchParams.append(key, value);
  }
  const newUrl = urlObj.href;
  return newUrl.startsWith(FAKE_ORIGIN) ? newUrl.slice(FAKE_ORIGIN.length + 1) : newUrl;
}

export function getPageExt(pagePath: string): string {
  const lastSubPath = pagePath.split('/').pop() ?? '';
  if (!lastSubPath.includes('.')) {
    return 'html';
  }
  const suffix = lastSubPath.split('.').pop() ?? '';
  return suffix.toLowerCase();
}
