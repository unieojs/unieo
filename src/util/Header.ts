// fork from https://github.com/jshttp/vary/blob/master/index.js#L96
import { isNil } from 'lodash';

export function parseHeader(header = ''): string[] {
  let end = 0;
  const list: string[] = [];
  let start = 0;
  // gather tokens
  for (let i = 0, len = header.length; i < len; i++) {
    switch (header.charCodeAt(i)) {
      case 0x20:
        if (start === end) {
          start = end = i + 1;
        }
        break;
      case 0x2c:
        list.push(header.substring(start, end));
        start = end = i + 1;
        break;
      default:
        end = i + 1;
        break;
    }
  }
  // final token
  list.push(header.substring(start, end));
  return list;
}

const REQUEST_HEADER_WHITELIST = [
  'cookie',
  'authorization',
  'did',
  'user-agent',
  'content-type',
  'accept',
  'accept-encoding',
  'accept-language',
  'referer',
  'cache-control',
  'x-user-group',
  'x-ldcid-level',
  'x-render-uid',
];

export function getReqHeaderObj(headers: Headers) {
  const headerObj: Record<string, string> = {};

  REQUEST_HEADER_WHITELIST.forEach(key => {
    const val = headers.get(key);
    if (!isNil(val)) {
      headerObj[key] = val;
    }
  });
  return headerObj;
}

export function getOriginalHeaderObj(headers: Headers) {
  const headerObj: Record<string, string> = {};

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  for (const key of headers.keys()) {
    const val = headers.get(key);
    if (!isNil(val)) {
      headerObj[key] = val;
    }
  }
  return headerObj;
}

// use set instead of append
export function appendHeader(headers: Headers, key: string, val?: string) {
  if (isNil(val)) {
    return;
  }
  const currentVal = headers.get(key);
  if (!isNil(currentVal)) {
    const headerList = parseHeader(currentVal);
    if (!headerList.includes(val)) {
      headers.set(key, `${headers.get(key)}, ${val}`);
    }
  } else {
    headers.set(key, val);
  }
}
