/**
 * @deprecated
 * DefaultFetch 已经集成了 ErrorFallback 的功能，不再需要单独使用 ErrorFallback
 */
import { isAvailableResponse } from '../util/Response';
import { genError, ErrorCode } from '../common/Error';
import type { RouteContext } from '../core';
import type { MiddlewareNext, MiddlewareGen, BaseMiddlewareOption } from './types';

interface ErrorFallbackMiddlewareOption extends BaseMiddlewareOption {
  allowNotFound: boolean;
}

const ErrorFallback: MiddlewareGen<ErrorFallbackMiddlewareOption> = opt => {
  return async (ctx: RouteContext, next: MiddlewareNext) => {
    const { allowNotFound } = opt;
    try {
      await next();
      const availableStatusList = allowNotFound ? [ 404 ] : [];
      if (!isAvailableResponse(ctx.response, { availableStatusList })) {
        throw genError(ErrorCode.RequestMiddlewareResponseInvalidError, {
          message: `status: ${ctx.response?.status}`,
          summary: `${ctx.response?.status}`,
        });
      }
    } catch (err) {
      ctx.logError(err instanceof Error ? err : new Error(String(err)));
      const res = await ctx.fallback();
      ctx.setResponse(res);
    }
  };
};

export default ErrorFallback;
