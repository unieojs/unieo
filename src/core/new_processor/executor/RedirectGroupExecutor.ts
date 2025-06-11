import type { GroupProcessor } from '../processor/GroupProcessor';
import type { RouteContext } from '../../RouteContext';
import type { ExecuteResult } from './decorators';
import { BaseGroupExecutor, GroupExecutor } from './decorators';

@GroupExecutor('redirects')
export class RedirectGroupExecutor extends BaseGroupExecutor {
  constructor(options: {
    groupProcessor: GroupProcessor;
  }) {
    super(options);
  }

  public async execute(ctx: RouteContext): Promise<ExecuteResult> {
    const result: ExecuteResult = {
      success: true,
      break: false,
      breakGroup: false,
    };

    if (!this.groupProcessor.needProcessMeta('redirects')) {
      return result;
    }

    const matchResult = await this.groupProcessor.checkMatch(ctx);
    if (!matchResult) {
      ctx.logger.info('not match');
      return result;
    }

    ctx.logger.info('redirect started');
    result.break = this.groupProcessor.break;

    for (const subProcessor of this.groupProcessor.subProcessors) {
      const subExecutor = this.subExecutors.get('redirects');
      if (!subExecutor) {
        continue;
      }

      const subResult = await subExecutor.execute(ctx);
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        break;
      }

      result.result = subResult.result;
      result.break = subResult.breakGroup;
      if (subResult.break) {
        break;
      }
    }

    ctx.logger.info(result.success ? 'redirect succeed' : 'redirect failed');
    return result;
  }
}
