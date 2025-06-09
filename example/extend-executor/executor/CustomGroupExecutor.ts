import { GroupExecutor } from '../../../src';
import { CustomGroupProcessor } from '../processor/group/CustomGroupProcessor';
import { CustomSubExecutor } from './CustomSubExecutor';
import { CustomContext } from '../core/CustomContext';

interface ExecuteResult {
  success: boolean;
  break: boolean;
}

export class CustomGroupExecutor extends GroupExecutor {
  readonly groupProcessor: CustomGroupProcessor;
  readonly subExecutors: CustomSubExecutor[];
  readonly ctx: CustomContext;

  constructor(groupProcessor: CustomGroupProcessor, options: {
    ctx: CustomContext;
  }) {
    super(groupProcessor, options);
    this.ctx = options.ctx;
    this.groupProcessor = groupProcessor;
    this.subExecutors = this.groupProcessor.subProcessors.map(subProcessor => {
      return new CustomSubExecutor(subProcessor, {
        ctx: this.ctx,
      });
    });
  }

  public async rewriteHostInfo(): Promise<ExecuteResult> {
    const result = {
      success: true,
      break: false,
    };
    if (!this.groupProcessor.needRewriteHostInfo) {
      return result;
    }
    const matchResult = await this.groupProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match');
      return result;
    }
    this.logger.info('initHostInfo started');
    result.break = this.groupProcessor.break;
    let hostInfo = this.ctx.hostInfo?.clone();
    if (!hostInfo) {
      this.logger.error('hostInfo is not set, cannot rewrite host info');
      return {
        success: false,
        break: false,
      };
    }
    for (const subExecutor of this.subExecutors) {
      const subResult = await subExecutor.rewriteHostInfo(hostInfo);
      result.success = subResult.success;
      if (!result.success) {
        result.break = false;
        break;
      }
      hostInfo = subResult.result!;
      if (subResult.breakGroup) result.break = true;
      if (subResult.break) {
        break;
      }
    }
    if (result.success) {
      this.ctx.hostInfo = hostInfo;
    }
    this.logger.info(result.success ? 'initHostInfo succeed' : 'initHostInfo failed');
    return result;
  }
}
