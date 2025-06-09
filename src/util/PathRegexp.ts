import { match, compile } from 'path-to-regexp';
import { appendSearchParams, getPath } from './Url';

export enum PathRegexpType {
  EXACT = 'exact',
  PATH_REGEXP = 'path_regexp',
}

export interface PathRegexpConfig {
  source: string;
  destination: string;
  type: PathRegexpType;
}

export function rewriteUrl(url: URL, config: PathRegexpConfig): string {
  const { origin, pathname, host, search, href } = url;
  const urlWithoutParams = `${origin}${pathname}`;
  switch (config.type) {
    case PathRegexpType.EXACT:
      if (config.source === urlWithoutParams) {
        return appendSearchParams(config.destination, new URLSearchParams(search));
      }
      break;
    case PathRegexpType.PATH_REGEXP: {
      try {
        const fn = match(getPath(config.source, host), { decode: decodeURIComponent });
        const pathMatchResult = fn(pathname);
        if (!pathMatchResult) {
          return href;
        }
        const destPath = compile(getPath(config.destination, host))({
          ...pathMatchResult.params,
        });
        const destination = new URL(destPath, config.destination);
        return appendSearchParams(destination, new URLSearchParams(search));
      } catch (err) {
        console.error(err);
        return href;
      }
    }
    default:
      return href;
  }
  return href;
}

// Redirect logic integration will be improved in future versions
export function rewritePath(origin: string, config: PathRegexpConfig): string {
  switch (config.type) {
    case PathRegexpType.EXACT:
      if (config.source === origin) {
        return config.destination;
      }
      break;
    case PathRegexpType.PATH_REGEXP: {
      try {
        const fn = match(config.source, { decode: decodeURIComponent });
        const pathMatchResult = fn(origin);
        if (!pathMatchResult) {
          return origin;
        }
        return compile(config.destination)({
          ...pathMatchResult.params,
        });
      } catch (err) {
        console.error(err);
        return origin;
      }
    }
    default:
      return origin;
  }
  return origin;
}
