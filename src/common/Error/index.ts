import { BaseError } from './Base';
import type { BaseErrorOptions } from './Base';

export * from './Base';

interface ErrorConfig {
  name: string;
  message: string;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ErrorOption = PartialBy<Omit<BaseErrorOptions, 'code'>, 'name'>;

export enum ErrorCode {
  /* ER 执行链路错误 - 1xxx */
  HostNotAccessError = 1001,
  GroupProcessorNotFoundError = 1002,
  SubProcessorNotFoundError = 1003,
  SubRouteCheckHostAccessError = 1004,
  SubRouteInitHostInfoError = 1005,
  SubRouteBeforeRequestError = 1006,
  SubRouteBeforeResponseError = 1007,
  RequestMiddlewareNotFoundError = 1008,
  RequestMiddlewareResponseInvalidError = 1009,
  HostResourceConfigInvalidError = 1010,
  PackRouteConfigInvalidError = 1011,
  HostResourceRequestError = 1012,
  RevisionNotFoundError = 1013,
  SubRouteRedirectError = 1014,
  RequestMiddlewareRedefined = 1015,
  SubRouteCheckHostForbidError = 1016,
  HostInfoNotInitError = 1017,
  CreateSubRouteContextError = 1018,
  AliyunHttpClientForbidRouteExecuteError = 1019,
  MethodNotAllowed = 1020,
  PathmapError = 1021,
  AMDCConfigError = 1022,
  AMDCRequestError = 1023,
  CORSHeaderAppendError = 1024,
  PathForbidden = 1025,
  SubRouteCheckHostInterceptError = 1026,
  RequestNotAllowed = 1027,
  /* KV 调用错误 - 2xxx */
  EdgeKVNotFoundError = 2001,
  EdgeKVRequestError = 2002,
  EdgeKVTimeoutError = 2003,
  /* SYSTEM ERROR - 3xxx */
  SystemError = 3001,
  NotFoundRenderOriginHostError = 3002,
  NotFoundTernError = 3003,
  NotFoundWebGWHostError = 3004,
  TimeoutError = 3005,
  /* RENDER 调用 - 4xxx */
  RenderConfigRequestError = 4001,
  RenderConfigTimeoutError = 4002,
  RenderAssetsRequestError = 4003,
  UnioVersionNotFoundError = 4004,
  /* FC 调用 - 5xxx */
  SSRPreludeResponseInvalidError = 5001,
  SSRPreludeResponseInvalidErrorAsEmptyVersion = 5002,
  SSRPreludeResponseInvalidErrorAsEmptyBody = 5003,
  SSRPostponedResponseInvalidError = 5010,
  SSRPostponedUncheckedError = 5100,
  SSRResponseStreamTimeout = 5200,
  /* 登录鉴权 - 6xxx */
  UserRouteConfigInvalidError = 6001,
  UnauthenticatedError = 6002,
  /* 中间件 - 7xxx */
  TernMiddlewareError = 7001,
  TernSiteExecutorStageError = 7002,
  TernResourceStatusError = 7003,
}

const ERROR_DEFINITION: Record<ErrorCode, ErrorConfig> = {
  [ErrorCode.RequestNotAllowed]: {
    name: 'RequestNotAllowed',
    message: 'request not allowed',
  },
  [ErrorCode.HostNotAccessError]: {
    name: 'HostNotAccessError',
    message: 'host not permit to execute route',
  },
  [ErrorCode.GroupProcessorNotFoundError]: {
    name: 'GroupProcessorNotFoundError',
    message: 'create group processor with type not found',
  },
  [ErrorCode.SubProcessorNotFoundError]: {
    name: 'SubProcessorNotFoundError',
    message: 'create sub processor with type not found',
  },
  [ErrorCode.SubRouteCheckHostInterceptError]: {
    name: 'SubRouteCheckHostInterceptError',
    message: 'sub route check host intercept execute error',
  },
  [ErrorCode.SubRouteCheckHostAccessError]: {
    name: 'SubRouteCheckHostAccessError',
    message: 'sub route check host access execute error',
  },
  [ErrorCode.SubRouteCheckHostForbidError]: {
    name: 'SubRouteCheckHostForbidError',
    message: 'sub route check host forbidden execute error',
  },
  [ErrorCode.HostInfoNotInitError]: {
    name: 'HostInfoNotInitError',
    message: 'hostInfo not init',
  },
  [ErrorCode.CreateSubRouteContextError]: {
    name: 'CreateSubRouteContextError',
    message: 'subRouteContext create error',
  },
  [ErrorCode.AliyunHttpClientForbidRouteExecuteError]: {
    name: 'AliyunHttpClientForbidRouteExecuteError',
    message: 'aliyunHttpClient forbid routeExecute',
  },
  [ErrorCode.MethodNotAllowed]: {
    name: 'MethodNotAllowed',
    message: 'method not allowed',
  },
  [ErrorCode.PathForbidden]: {
    name: 'PathForbidden',
    message: 'path is forbidden',
  },
  [ErrorCode.PathmapError]: {
    name: 'PathmapError',
    message: 'pathmap error',
  },
  [ErrorCode.AMDCConfigError]: {
    name: 'AMDCConfigError',
    message: 'AMDC config error',
  },
  [ErrorCode.AMDCRequestError]: {
    name: 'AMDCRequestError',
    message: 'AMDC request error',
  },
  [ErrorCode.CORSHeaderAppendError]: {
    name: 'CORSHeaderAppendError',
    message: 'append CORS header error',
  },
  [ErrorCode.SubRouteInitHostInfoError]: {
    name: 'SubRouteInitHostInfoError',
    message: 'sub route init host info execute error',
  },
  [ErrorCode.SubRouteBeforeRequestError]: {
    name: 'SubRouteBeforeRequestError',
    message: 'sub route before request execute error',
  },
  [ErrorCode.SubRouteBeforeResponseError]: {
    name: 'SubRouteBeforeResponseError',
    message: 'sub route before response execute error',
  },
  [ErrorCode.RequestMiddlewareNotFoundError]: {
    name: 'RequestMiddlewareNotFoundError',
    message: 'request middleware not found',
  },
  [ErrorCode.RequestMiddlewareResponseInvalidError]: {
    name: 'RequestMiddlewareResponseInvalidError',
    message: 'request middleware response invalid',
  },
  [ErrorCode.HostResourceConfigInvalidError]: {
    name: 'HostResourceConfigInvalidError',
    message: 'host resource config invalid',
  },
  [ErrorCode.PackRouteConfigInvalidError]: {
    name: 'PackRouteConfigInvalidError',
    message: 'pack route config request from render with invalid code',
  },
  [ErrorCode.HostResourceRequestError]: {
    name: 'HostResourceRequestError',
    message: 'host resource request error',
  },
  [ErrorCode.RevisionNotFoundError]: {
    name: 'RevisionNotFoundError',
    message: 'revision not found',
  },
  [ErrorCode.SubRouteRedirectError]: {
    name: 'SubRouteRedirectError',
    message: 'sub route redirect execute error',
  },
  [ErrorCode.RequestMiddlewareRedefined]: {
    name: 'RequestMiddlewareRedefined',
    message: 'request middleware redefined error',
  },
  [ErrorCode.EdgeKVNotFoundError]: {
    name: 'EdgeKVNotFoundError',
    message: 'EdgeKV not found',
  },
  [ErrorCode.EdgeKVRequestError]: {
    name: 'EdgeKVRequestError',
    message: 'EdgeKV request error',
  },
  [ErrorCode.EdgeKVTimeoutError]: {
    name: 'EdgeKVTimeoutError',
    message: 'EdgeKV request timeout',
  },
  [ErrorCode.SystemError]: {
    name: 'SystemError',
    message: 'system error',
  },
  [ErrorCode.NotFoundTernError]: {
    name: 'NotFoundTernError',
    message: 'tern not found',
  },
  [ErrorCode.NotFoundWebGWHostError]: {
    name: 'NotFoundWebGWHostError',
    message: 'not found webGWHost',
  },
  [ErrorCode.TimeoutError]: {
    name: 'TimeoutError',
    message: 'timeout',
  },
  [ErrorCode.NotFoundRenderOriginHostError]: {
    name: 'NotFoundRenderOriginHostError',
    message: 'not found renderOriginHost',
  },
  [ErrorCode.RenderConfigRequestError]: {
    name: 'RenderConfigRequestError',
    message: 'render config request error',
  },
  [ErrorCode.RenderConfigTimeoutError]: {
    name: 'RenderConfigTimeoutError',
    message: 'render config request timeout',
  },
  [ErrorCode.RenderAssetsRequestError]: {
    name: 'RenderAssetsRequestError',
    message: 'render assets request error',
  },
  [ErrorCode.UnioVersionNotFoundError]: {
    name: 'UnioVersionNotFoundError',
    message: 'html has no unio version on response header',
  },
  [ErrorCode.SSRPreludeResponseInvalidError]: {
    name: 'SSRPreludeResponseInvalidError',
    message: 'ssr prelude response invalid',
  },
  [ErrorCode.SSRPreludeResponseInvalidErrorAsEmptyVersion]: {
    name: 'SSRPreludeResponseInvalidErrorAsEmptyVersion',
    message: 'ssr prelude response invalid as empty version',
  },
  [ErrorCode.SSRPreludeResponseInvalidErrorAsEmptyBody]: {
    name: 'SSRPreludeResponseInvalidErrorAsEmptyBody',
    message: 'ssr prelude response invalid as empty body',
  },
  [ErrorCode.SSRPostponedResponseInvalidError]: {
    name: 'SSRPostponedResponseInvalidError',
    message: 'ssr postponed response invalid error',
  },
  [ErrorCode.SSRPostponedUncheckedError]: {
    name: 'SSRPostponedUncheckedError',
    message: 'ssr postponed unchecked error',
  },
  [ErrorCode.SSRResponseStreamTimeout]: {
    name: 'SSRResponseStreamTimeout',
    message: 'ssr response stream timeout',
  },
  [ErrorCode.UserRouteConfigInvalidError]: {
    name: 'UserRouteConfigInvalidError',
    message: 'user route config invalid error',
  },
  [ErrorCode.UnauthenticatedError]: {
    name: 'UnauthenticatedError',
    message: 'unauthenticated',
  },
  [ErrorCode.TernMiddlewareError]: {
    name: 'TernMiddlewareError',
    message: 'tern middleware executing error',
  },
  [ErrorCode.TernSiteExecutorStageError]: {
    name: 'TernSiteExecutorStageError',
    message: 'tern siteExecutor stage error',
  },
  [ErrorCode.TernResourceStatusError]: {
    name: 'TernResourceStatusError',
    message: 'tern resource status error',
  },
};

export function genError(code: ErrorCode, errorOption?: string | ErrorOption | Error): BaseError {
  let errorConfig = ERROR_DEFINITION[code];
  let errorMessage = errorConfig.message;
  if (typeof errorOption === 'string') {
    errorMessage += `: ${errorOption}`;
  } else if (errorOption instanceof Error) {
    errorMessage += `: ${errorOption.message}`;
    errorConfig = {
      ...errorConfig,
      // 原生异常的 name 跟 stack 都不可枚举，不能用析构
      name: errorOption.name,
      stack: errorOption.stack,
    } as ErrorConfig;
  } else if (errorOption?.message) {
    errorMessage += `: ${errorOption.message as string}`;
    errorConfig = {
      ...errorConfig,
      ...errorOption,
    } as ErrorConfig;
  }
  // 将 error 转换为标准的 error 模型
  return new BaseError({
    ...errorConfig,
    code,
    message: errorMessage,
  });
}
