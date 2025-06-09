import type { GroupProcessor, RouteContext } from '../core';
import type { MiddlewareConfig } from '../middleware/types';
import type { ERRequestInit, ILogger } from '../types';
import { SubExecutor } from './SubExecutor';

interface ExecuteResult {
  success: boolean;
  break: boolean;
}

interface RequestInfo {
  requestInit: ERRequestInit;
  middlewares: MiddlewareConfig[];
}

export class GroupExecutor {
  protected readonly groupProcessor: GroupProcessor;
  protected readonly subExecutors: SubExecutor[];
  protected readonly logger: ILogger;
  protected readonly ctx: RouteContext;
  protected _stashRequestInfo?: RequestInfo;

  constructor(groupProcessor: GroupProcessor, options: {
    ctx: RouteContext;
  }) {
    this.logger = groupProcessor.logger;
    this.ctx = options.ctx;
    this.groupProcessor = groupProcessor;
    this.subExecutors = this.groupProcessor.subProcessors.map(subProcessor => {
      return new SubExecutor(subProcessor, {
        ctx: this.ctx,
      });
    });
  }

  public async redirect(): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needRedirect) {
      return result;
    }
    const matchResult = await this.groupProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match');
      return result;
    }
    this.logger.info('redirect started');
    result.break = this.groupProcessor.break;
    let redirectResponse: Response | undefined;
    for (const subExecutor of this.subExecutors) {
      const subResult = await subExecutor.redirect();
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        break;
      }
      redirectResponse = subResult.result;
      result.break = subResult.breakGroup;
      if (subResult.break) {
        break;
      }
    }
    if (redirectResponse) this.ctx.setResponse(redirectResponse);
    this.logger.info(redirectResponse ? 'redirect succeed' : 'redirect failed');
    return result;
  }

  public async beforeRequest(): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needBeforeRequest) {
      return result;
    }
    const matchResult = await this.groupProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match');
      return result;
    }
    this.logger.info('beforeRequest started');
    result.break = this.groupProcessor.break;
    this.stashRequestInfo();
    let request = this.ctx.request.clone();
    for (const subExecutor of this.subExecutors) {
      const subResult = await subExecutor.beforeRequest(request);
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        this.restoreRequestInfo();
        break;
      }
      request = subResult.result!;
      if (subResult.breakGroup) result.break = true;
      if (subResult.break) {
        break;
      }
    }
    if (result.success) this.ctx.setRequest(request);
    this.logger.info(result.success ? 'beforeRequest succeed' : 'beforeRequest failed');
    return result;
  }

  public async beforeResponse(): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needBeforeResponse) {
      return result;
    }
    const matchResult = await this.groupProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('beforeResponse started');
    result.break = this.groupProcessor.break;
    let response = this.ctx.response?.clone();
    if (!response) {
      this.logger.error('response is undefined');
      result.success = false;
      return result;
    }
    for (const subExecutor of this.subExecutors) {
      const subResult = await subExecutor.beforeResponse(response);
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        break;
      }
      response = subResult.result!;
      if (subResult.breakGroup) result.break = true;
      if (subResult.break) {
        break;
      }
    }
    if (result.success) this.ctx.setResponse(response);
    this.logger.info(result.success ? 'beforeResponse succeed' : 'beforeResponse failed');
    return result;
  }

  // public async getGreyOption(): Promise<GreyOption> {
  //   const greyOption: GreyOption = {
  //     xUserGroup: this.ctx.request.headers.get('x-user-group') || '',
  //     xLdcidLevel: this.ctx.request.headers.get('x-ldcid-level') || '',
  //   };
  //   if (!CommonGroupProcessor.isGreyGroupRoute(this.groupProcessor)) {
  //     return greyOption;
  //   }
  //   const matchResult = await this.groupProcessor.checkMatch();
  //   if (!matchResult) {
  //     this.logger.info('not match, skipped');
  //     return greyOption;
  //   }
  //   this.logger.info('getGreyOption started');
  //   const request = this.ctx.request.clone();
  //   let success = true;
  //   for (const subExecutor of this.subExecutors) {
  //     const subResult = await subExecutor.beforeRequest(request);
  //     success = subResult.success;
  //     if (!success) {
  //       break;
  //     }
  //   }
  //   this.logger.info(success ? 'getGreyOption succeed' : 'getGreyOption failed');
  //   if (!success) {
  //     return greyOption;
  //   }
  //   // 执行完成后
  //   greyOption.xUserGroup = request.headers.get('x-user-group') || '';
  //   greyOption.xLdcidLevel = request.headers.get('x-ldcid-level') || '';
  //   return greyOption;
  // }

  private stashRequestInfo() {
    // requestInit 目前是 key-value 形式，简单的 clone 即可
    this._stashRequestInfo = {
      requestInit: { ...this.ctx.requestInit },
      middlewares: [ ...this.ctx.middlewares ],
    };
  }

  private restoreRequestInfo() {
    if (this._stashRequestInfo) {
      this.ctx.requestInit = this._stashRequestInfo.requestInit;
      this.ctx.setMiddlewares(this._stashRequestInfo.middlewares);
    }
  }
}
