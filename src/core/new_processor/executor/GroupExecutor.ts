import type { GroupProcessor } from '../processor/GroupProcessor';
import type { RouteContext } from '../../RouteContext';
import { SubExecutor } from './SubExecutor';
import { MetaManager } from '../meta/MetaManager';

interface ExecuteResult {
  success: boolean;
  break: boolean;
}

export class GroupExecutor {
  private readonly groupProcessor: GroupProcessor;
  private readonly subExecutors: SubExecutor[];

  constructor(options: {
    groupProcessor: GroupProcessor;
  }) {
    this.groupProcessor = options.groupProcessor;
    this.subExecutors = this.groupProcessor.subProcessors.map(subProcessor => {
      return new SubExecutor({ subProcessor });
    });
  }

  public async executeMeta(type: string, ctx: RouteContext): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needExecuteMeta(type)) {
      return result;
    }
    const matchResult = await this.groupProcessor.checkMatch(ctx);
    if (!matchResult) {
      ctx.logger.info('not match');
      return result;
    }
    ctx.logger.info('redirect started');
    result.break = this.groupProcessor.break;
    let metaResult;
    for (const subExecutor of this.subExecutors) {
      const subResult = await subExecutor.executeMeta(type, ctx);
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        break;
      }
      metaResult = subResult.result;
      result.break = subResult.breakGroup;
      if (subResult.break) {
        break;
      }
    }
    if (metaResult) {
      MetaManager.getInstance().create();
    }
    ctx.logger.info(metaResult ? `${type} succeed` : `${type} failed`);
    return result;
  }
}
