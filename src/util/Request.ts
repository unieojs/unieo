/**
 * 校验两个 request 是否 url 相同
 * 暂时只比较 host 和 pathname，不比较 search
 */
export function checkRequestSameUrl(a: Request, b: Request): boolean {
  const urlA = new URL(a.url);
  const urlB = new URL(b.url);
  return urlA.host === urlB.host && urlA.pathname === urlB.pathname;
}

/**
 * 将 render request 中的一些请求头清理掉，避免 CDN 返回 304 导致取不到内容
 * @param request 原始 render HTML 请求
 */
export const cleanseRenderRequest = (request: Request): Request => {
  request.headers.set('cache-control', 'no-store');
  request.headers.delete('if-none-match');
  request.headers.delete('if-modified-since');

  return request;
};
