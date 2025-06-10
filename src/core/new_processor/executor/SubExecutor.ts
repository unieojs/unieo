import type { SubProcessor } from '../processor/SubProcessor';
import { ErrorCode, genError } from '../../../common/Error';
import type { RouteContext } from '../../RouteContext';

export interface ExecuteResult<T> {
  success: boolean;
  break: boolean;
  breakGroup: boolean;
  result?: T;
}

export class SubExecutor {
  private readonly subProcessor: SubProcessor;

  constructor(options: {
    subProcessor: SubProcessor;
  }) {
    this.subProcessor = options.subProcessor;
  }

  public async executeMeta<T>(type: string, ctx: RouteContext) {
    const result: ExecuteResult<T> = {
      success: true,
      break: false,
      breakGroup: false,
    };
    if (!this.subProcessor.needExecuteMeta(type)) {
      return result;
    }
    const matchResult = await this.subProcessor.checkMatch(ctx);
    if (!matchResult) {
      ctx.logger.info('not match, skipped');
      return result;
    }
    ctx.logger.info('redirect started');
    try {
      result.result = await this.subProcessor.executeMeta(type, ctx) as T;
      // 重定向命中后，默认 break 和 breakGroup
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
