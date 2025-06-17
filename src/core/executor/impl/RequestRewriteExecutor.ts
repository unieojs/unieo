import type { ExecuteResult, SubExecuteResult } from '../BaseExecutor';
import { BaseExecutor } from '../BaseExecutor';
import { ErrorCode, genError } from '../../../common/Error';
import type { SubProcessor, GroupProcessor } from '../../processor';
import { MetaType } from '../../meta/enum';
import type { RouteContext } from '../../RouteContext';
import type { ERRequestInit } from '../../../types';
import type { MiddlewareConfig } from '../../../middleware/types';

interface RequestInfo {
  requestInit: ERRequestInit;
  middlewares: MiddlewareConfig[];
}

export class RequestRewriteExecutor extends BaseExecutor {
  protected _stashRequestInfo?: RequestInfo;

  constructor(options: {
    groupProcessor: GroupProcessor;
    ctx: RouteContext;
  }) {
    super({
      ...options,
      type: MetaType.REQUEST_REWRITE,
    });
  }

  public async executeSub(subProcessor: SubProcessor, request: Request) {
    const result: SubExecuteResult<Request> = {
      success: true,
      break: false,
      breakGroup: false,
      result: request,
    };
    if (!subProcessor.needProcess(this.type)) {
      return result;
    }
    const matchResult = await subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('beforeRequest started');
    result.break = subProcessor.break;
    result.breakGroup = subProcessor.breakGroup;
    try {
      result.result = await subProcessor.process(this.type, request) as Request;
      this.logger.info('beforeRequest succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteBeforeRequestError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      this.ctx.logError(error);
      if (!subProcessor.weakDep) {
        return {
          success: false,
          break: false,
          breakGroup: false,
        };
      }
    }
    return result;
  }

  public async execute(): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needProcess(this.type)) {
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
    for (const subProcessor of this.groupProcessor.subProcessors) {
      const subResult = await this.executeSub(subProcessor, request);
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
