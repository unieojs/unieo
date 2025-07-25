import type { MiddlewareGen, BaseMiddlewareOption } from './types';
import { checkRequestSameUrl } from '../util/Request';
import { isAvailableResponse } from '../util/Response';
import { genError, ErrorCode } from '../common/Error';
import type { RouteContext } from '../core';

interface DefaultFetchMiddlewareOption extends BaseMiddlewareOption {
  responseErrorFallback: boolean;
  allowNotFound: boolean;
}

const DefaultFetch: MiddlewareGen<DefaultFetchMiddlewareOption> = opt => {
  return async (ctx: RouteContext, next) => {
    await next();
    // 如果已经有 response，直接跳过
    let response = ctx.response;
    if (!response) {
      response = await ctx.httpClient.request(ctx.request, ctx.requestInit);
      ctx.setResponse(response);
    }
    const { allowNotFound, responseErrorFallback } = opt;
    if (!responseErrorFallback) {
      return;
    }

    // 响应校验
    const availableStatusList = allowNotFound ? [ 404 ] : [];
    // 如果响应错误，且发生过 request rewrite，则认为是这个改写导致的请求异常，需要进行 fallback
    if (
      response &&
      !checkRequestSameUrl(ctx.request, ctx.originRequest) &&
      !isAvailableResponse(response, { availableStatusList })
    ) {
      ctx.logError(
        genError(ErrorCode.MiddlewareResponseInvalidError, {
          message: `status: ${response.status}`,
          summary: `${response.status}`,
        }),
      );
      response = await ctx.fallback();
      ctx.setResponse(response);
    }
    return;
  };
};

export default DefaultFetch;
