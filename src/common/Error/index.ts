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
  /* SYSTEM ERROR - 10xx */
  SystemError = 1001,
  TimeoutError = 1002,
  /* INITIALIZATION ERROR - 11xx */
  GroupProcessorNotFoundError = 1101,
  SubProcessorNotFoundError = 1102,
  LoadMiddlewareNotFoundError = 1103,
  /* ROUTE META ERROR - 12xx */
  SubRouteRedirectError = 1201,
  SubRouteBeforeRequestError = 1202,
  SubRouteBeforeResponseError = 1203,
  /* MIDDLEWARE ERROR - 13xx */
  MiddlewareResponseInvalidError = 1301,
}

const ERROR_DEFINITION: Record<ErrorCode, ErrorConfig> = {
  [ErrorCode.GroupProcessorNotFoundError]: {
    name: 'GroupProcessorNotFoundError',
    message: 'create group processor with type not found',
  },
  [ErrorCode.SubProcessorNotFoundError]: {
    name: 'SubProcessorNotFoundError',
    message: 'create sub processor with type not found',
  },
  [ErrorCode.SubRouteBeforeRequestError]: {
    name: 'SubRouteBeforeRequestError',
    message: 'sub route before request execute error',
  },
  [ErrorCode.SubRouteBeforeResponseError]: {
    name: 'SubRouteBeforeResponseError',
    message: 'sub route before response execute error',
  },
  [ErrorCode.LoadMiddlewareNotFoundError]: {
    name: 'RequestMiddlewareNotFoundError',
    message: 'request middleware not found',
  },
  [ErrorCode.MiddlewareResponseInvalidError]: {
    name: 'RequestMiddlewareResponseInvalidError',
    message: 'request middleware response invalid',
  },
  [ErrorCode.SubRouteRedirectError]: {
    name: 'SubRouteRedirectError',
    message: 'sub route redirect execute error',
  },
  [ErrorCode.SystemError]: {
    name: 'SystemError',
    message: 'system error',
  },
  [ErrorCode.TimeoutError]: {
    name: 'TimeoutError',
    message: 'timeout',
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
