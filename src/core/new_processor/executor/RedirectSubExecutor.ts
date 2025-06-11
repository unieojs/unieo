import type { SubProcessor } from '../processor/SubProcessor';
import type { RouteContext } from '../../RouteContext';
import type { ExecuteResult } from './decorators';
import { BaseSubExecutor } from './decorators';
import { ErrorCode, genError } from '../../../common/Error';

export class RedirectSubExecutor extends BaseSubExecutor {
  constructor(options: {
    subProcessor: SubProcessor;
  }) {
    super(options);
  }

  public async execute(ctx: RouteContext): Promise<ExecuteResult> {
    const result: ExecuteResult = {
      success: true,
      break: false,
      breakGroup: false,
    };

    if (!this.subProcessor.needProcessMeta('redirects')) {
      return result;
    }

    const matchResult = await this.subProcessor.checkMatch(ctx);
    if (!matchResult) {
      ctx.logger.info('not match, skipped');
      return result;
    }

    ctx.logger.info('redirect started');
    result.break = this.subProcessor.break;
    result.breakGroup = this.subProcessor.breakGroup;

    try {
      result.result = await this.subProcessor.processMeta('redirects', ctx);
      result.break = !!result.result;
      result.breakGroup = result.break;
      ctx.logger.info('redirect succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteRedirectError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      ctx.logError(error);
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
