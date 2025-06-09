import { RedirectType } from '../common/Enum';
import {
  ALIPAY_SCHEMA_PROTOCOL,
  appendSearchParams,
  getHost,
  getPath,
  getProtocol,
  getSearch,
  HTTP_PROTOCOL,
  isValidUrl,
} from './Url';
import { compile, match } from 'path-to-regexp';

const FAKE_DESTINATION_PROTOCOL = 'https:';
export interface RedirectData {
  // 区分是 301 / 302
  permanent?: boolean;
  // 原始路径
  source: string;
  type: RedirectType;
  // 目标路径
  destination: string;
  // 透传参数
  passQuery?: boolean;
}

export interface RedirectResult {
  href: string;
  status: number;
}

export class RedirectHelper {
  permanent: boolean;
  source: string;
  destination?: string;
  type: RedirectType;
  passQuery: boolean;
  // 由于边缘计算环境支持除 http / https 以外的 schema，需要兼容下
  originalDestinationProtocol = '';

  constructor(raw: RedirectData) {
    this.permanent = !!raw.permanent;
    this.source = raw.source;
    this.type = raw.type;
    this.passQuery = raw.passQuery !== false;
    this.destination = raw.destination;
    if (isValidUrl(raw.destination)) {
      const protocol = getProtocol(raw.destination);
      if (!HTTP_PROTOCOL.includes(protocol)) {
        this.originalDestinationProtocol = protocol;
        this.destination = raw.destination.replace(this.originalDestinationProtocol, FAKE_DESTINATION_PROTOCOL);
      }
    }
  }

  redirect(url: URL): RedirectResult | null {
    try {
      if (!this.destination || !this.source) {
        return null;
      }
      const statusCode = this.permanent ? 301 : 302;
      // 有 source，需要判断是否匹配
      let redirectUrl = this.getRedirectUrl(url);
      if (!redirectUrl) {
        return null;
      }
      // 透传参数
      if (this.passQuery) {
        const opts = {
          isAlipaySchema: ALIPAY_SCHEMA_PROTOCOL.includes(this.originalDestinationProtocol),
        };
        redirectUrl = appendSearchParams(redirectUrl, new URLSearchParams(url.search), opts);
      }
      // 替换 protocol
      if (this.originalDestinationProtocol) {
        redirectUrl = redirectUrl.replace(FAKE_DESTINATION_PROTOCOL, this.originalDestinationProtocol);
      }
      return {
        href: redirectUrl,
        status: statusCode,
      };
    } catch (err) {
      // Path matching failed, log error and continue processing
      console.error('Redirect path matching failed:', err);
    }
    return null;
  }

  public getRedirectUrl(url: URL): string | null {
    switch (this.type) {
      case RedirectType.URL:
        return this.getUrlRedirectUrl(url);
      case RedirectType.PATH:
        return this.getPathRedirectUrl(url);
      case RedirectType.PATH_REGEXP:
        return this.getPathRegexpRedirectUrl(url);
      default:
        return null;
    }
  }

  private getUrlRedirectUrl(url: URL): string | null {
    const urlWithoutParams = `${url.origin}${url.pathname}`;
    if (urlWithoutParams !== this.source) {
      return null;
    }
    return this.destination ?? null;
  }

  private getPathRedirectUrl(url: URL): string | null {
    if (url.pathname !== this.source) {
      return null;
    }
    return this.destination ?? null;
  }

  private getPathRegexpRedirectUrl(url: URL): string | null {
    // 先判断 host
    const sourceHost = getHost(this.source, url.host);
    if (sourceHost !== url.host) {
      return null;
    }
    const pathMatchResult = this.getPathMatchResult(url);
    if (!pathMatchResult) {
      return null;
    }
    const queryMatchResult = this.getQueryMatchResult(url);
    if (!queryMatchResult) {
      return null;
    }
    const destPath = compile(getPath(this.destination!, url.host))({
      ...pathMatchResult,
      ...queryMatchResult,
    });
    return new URL(destPath, this.destination).href;
  }

  private getPathMatchResult(url: URL): object | null {
    const fn = match(getPath(this.source, url.host), { decode: decodeURIComponent });
    const pathMatchResult = fn(url.pathname);
    if (!pathMatchResult) {
      return null;
    }
    return pathMatchResult.params;
  }

  private getQueryMatchResult(url: URL): object | null {
    const sourceSearch = getSearch(this.source, url.host);
    if (!sourceSearch) {
      // 无 search 是预期中，不返回 null
      return {};
    }
    // filter ctx.search
    const sourceSearchParams = new URLSearchParams(sourceSearch);
    const originSearchParams = new URLSearchParams(url.search);
    const formattedSearchParams = new URLSearchParams();
    // FBI warning
    // 不能用 originSearchParams.forEach，因为在某些环境中参数顺序是 (key, value)
    // 文档中是 (value, key) https://developer.mozilla.org/zh-CN/docs/Web/API/URLSearchParams/forEach
    // 不能用 originSearchParams.keys，因为多个相同的 key 会被忽略，只触发一次
    for (const [ key, value ] of originSearchParams.entries()) {
      if (sourceSearchParams.has(key)) {
        formattedSearchParams.append(key, value);
      }
    }
    // 调用 URLSearchParams.toString() 会自动 encode
    const fn = match(sourceSearch.substring(1), { decode: decodeURIComponent });
    const queryMatchResult = fn(formattedSearchParams.toString());
    if (!queryMatchResult) {
      return null;
    }
    return queryMatchResult.params;
  }
}
