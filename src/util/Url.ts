import { isString } from 'lodash';

export const HTTP_PROTOCOL = [ 'https:', 'http:' ];

export const AVAIL_PROTOCOL = [ ...HTTP_PROTOCOL ];

export function isValidUrl(urlStr: string): boolean {
  let url;
  try {
    url = new URL(urlStr);
  } catch (err) {
    // URL parsing failed for non-standard protocols, log warning for debugging
    console.error('URL parsing failed:', err);
    return false;
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
    try {
      return new URL(urlStr).host;
    } catch (err) {
      // Fallback to defaultHost if URL parsing fails, log warning for debugging
      console.warn('URL parsing failed in getHost:', err);
      return defaultHost;
    }
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

export function appendSearchParams(url: string | URL, searchParams: URLSearchParams) {
  const urlObj = isString(url) ? new URL(url) : url;
  const originSearchParams = urlObj.searchParams;
  for (const [ key, value ] of searchParams.entries()) {
    originSearchParams.append(key, value);
  }
  return urlObj.href;
}

export function getPageExt(pagePath: string): string {
  const lastSubPath = pagePath.split('/').pop() ?? '';
  if (!lastSubPath.includes('.')) {
    return 'html';
  }
  const suffix = lastSubPath.split('.').pop() ?? '';
  return suffix.toLowerCase();
}
