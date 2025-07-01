import type { SubExecuteResult } from '../BaseExecutor';
import { BaseExecutor } from '../BaseExecutor';
import { ErrorCode, genError } from '../../../common/Error';
import type { GroupProcessor, SubProcessor } from '../../processor';
import { MetaType } from '../../meta';
import type { RouteContext } from '../../RouteContext';

export class RedirectExecutor extends BaseExecutor {
  constructor(options: {
    groupProcessor: GroupProcessor;
    ctx: RouteContext;
  }) {
    super({
      ...options,
      type: MetaType.REDIRECT,
    });
  }

  public async executeSub(subProcessor: SubProcessor) {
    const result: SubExecuteResult<Response> = {
      success: true,
      break: false,
      breakGroup: false,
    };
    if (!subProcessor.needProcess(this.type)) {
      return result;
    }
    const matchResult = await subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('redirect started');
    try {
      result.result = (await subProcessor.process(this.type)) as Response | undefined;
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

  public async execute() {
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
    this.logger.info('redirect started');
    result.break = this.groupProcessor.break;
    let redirectResponse: Response | undefined;
    for (const subProcessor of this.groupProcessor.subProcessors) {
      const subResult = await this.executeSub(subProcessor);
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
}
