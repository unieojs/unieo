import type { RouteContext, SubProcessor } from '../core';
import type { ILogger } from '../types';
import { ErrorCode, genError } from '../common/Error';

export interface ExecuteResult<T> {
  success: boolean;
  break: boolean;
  breakGroup: boolean;
  result?: T;
}

export class SubExecutor {
  protected readonly subProcessor: SubProcessor;
  protected readonly logger: ILogger;
  protected readonly ctx: RouteContext;

  constructor(subProcessor: SubProcessor, options: {
    ctx: RouteContext;
  }) {
    this.subProcessor = subProcessor;
    this.logger = subProcessor.logger;
    this.ctx = options.ctx;
  }

  public async redirect(): Promise<ExecuteResult<Response>> {
    const result: ExecuteResult<Response> = {
      success: true,
      break: false,
      breakGroup: false,
    };
    if (!this.subProcessor.needRedirect) {
      return result;
    }
    const matchResult = await this.subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('redirect started');
    try {
      result.result = await this.subProcessor.redirect();
      // 重定向命中后，默认 break 和 breakGroup
      result.break = !!result.result;
      result.breakGroup = result.break;
      this.logger.info('redirect succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteRedirectError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      this.ctx.logError(error);
      if (!this.subProcessor.weakDep) {
        return {
          success: false,
          break: false,
          breakGroup: false,
        };
      }
    }
    return result;
  }

  public async beforeRequest(request: Request): Promise<ExecuteResult<Request>> {
    const result = {
      success: true,
      break: false,
      breakGroup: false,
      result: request,
    };
    if (!this.subProcessor.needBeforeRequest) {
      return result;
    }
    const matchResult = await this.subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('beforeRequest started');
    result.break = this.subProcessor.break;
    result.breakGroup = this.subProcessor.breakGroup;
    try {
      result.result = await this.subProcessor.beforeRequest(request);
      this.logger.info('beforeRequest succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteBeforeRequestError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      this.ctx.logError(error);
      if (!this.subProcessor.weakDep) {
        return {
          success: false,
          break: false,
          breakGroup: false,
        };
      }
    }
    return result;
  }

  public async beforeResponse(response: Response): Promise<ExecuteResult<Response>> {
    const result = {
      success: true,
      break: false,
      breakGroup: false,
      result: response,
    };
    if (!this.subProcessor.needBeforeResponse) {
      return result;
    }
    const matchResult = await this.subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('beforeResponse started');
    result.break = this.subProcessor.break;
    result.breakGroup = this.subProcessor.breakGroup;
    try {
      result.result = await this.subProcessor.beforeResponse(response);
      this.logger.info('beforeResponse succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteBeforeResponseError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      this.ctx.logError(error);
      if (!this.subProcessor.weakDep) {
        return {
          success: false,
          break: false,
          breakGroup: false,
        };
      }
    }
    return result;
  }
}
