interface IsAvailableResponseOption {
  availableStatusList?: number[];
  unAvailableStatusList?: number[];
}

export function isAvailableResponse(res?: Response, option?: IsAvailableResponseOption): boolean {
  const { availableStatusList = [], unAvailableStatusList = [] } = option ?? {};
  // res 为空或在黑名单中
  if (!res || unAvailableStatusList.includes(res.status)) {
    return false;
  }
  // 默认 2xx 3xx 为可用状态码
  return (res.status >= 200 && res.status < 400) || availableStatusList.includes(res.status);
}

export function isJSONResponse(res?: Response): boolean {
  const contentType = res?.headers.get('content-type');
  return !!contentType?.includes('application/json');
}

/**
 * 清理流式响应的响应头
 */
export const cleanseStreamingResponse = (response: Response): Response => {
  const { headers } = response;
  // 流式响应不能带 content-encoding，否则会导致浏览器报错
  headers.delete('content-encoding');
  // 流式响应不应该设置 content-length
  headers.delete('content-length');

  return response;
};
