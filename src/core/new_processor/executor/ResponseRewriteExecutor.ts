import type { ExecuteResult, SubExecuteResult } from './BaseExecutor';
import { BaseExecutor } from './BaseExecutor';
import { ErrorCode, genError } from '../../../common/Error';
import type { SubProcessor } from '../processor';
import { MetaType } from '../enum';
import type { RouteContext } from '../../RouteContext';
import type { GroupProcessor } from '../processor';

export class ResponseRewriteExecutor extends BaseExecutor {
  constructor(options: {
    groupProcessor: GroupProcessor;
    ctx: RouteContext;
  }) {
    super({
      ...options,
      type: MetaType.RESPONSE_REWRITE,
    });
  }

  public async executeSub(subProcessor: SubProcessor, response: Response) {
    const result: SubExecuteResult<Response> = {
      success: true,
      break: false,
      breakGroup: false,
      result: response,
    };
    if (!subProcessor.needProcess(this.type)) {
      return result;
    }
    const matchResult = await subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('beforeResponse started');
    result.break = subProcessor.break;
    result.breakGroup = subProcessor.breakGroup;
    try {
      result.result = await subProcessor.process(this.type, response) as Response;
      this.logger.info('beforeResponse succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteBeforeResponseError, {
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
    for (const subProcessor of this.groupProcessor.subProcessors) {
      const subResult = await this.executeSub(subProcessor, response);
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
}
