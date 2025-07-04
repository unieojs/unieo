/**
 * 校验两个 request 是否 url 相同
 * 暂时只比较 host 和 pathname，不比较 search
 */
export function checkRequestSameUrl(a: Request, b: Request): boolean {
  const urlA = new URL(a.url);
  const urlB = new URL(b.url);
  return urlA.host === urlB.host && urlA.pathname === urlB.pathname;
}
