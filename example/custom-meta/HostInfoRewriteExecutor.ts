import type { SubProcessor } from '../../src';
import { BaseExecutor, type GroupProcessor } from '../../src';
import type { SubExecuteResult } from '../../src/core/executor/BaseExecutor';
import type { HostInfo } from './HostInfo';
import { ErrorCode, genError } from '../../src/common/Error';
import type { CustomContext } from './CustomContext';

export class HostInfoRewriteExecutor extends BaseExecutor<CustomContext> {
  constructor(options: {
    groupProcessor: GroupProcessor;
    ctx: CustomContext;
  }) {
    super({
      ...options,
      type: 'hostInfoRewrites',
    });
  }

  private async executeSub(subProcessor: SubProcessor, hostInfo: HostInfo) {
    const result: SubExecuteResult<HostInfo> = {
      success: true,
      break: false,
      breakGroup: false,
      result: hostInfo,
    };
    if (!subProcessor.needProcess(this.type)) {
      return result;
    }
    const matchResult = await subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('initHostInfo started');
    result.break = subProcessor.break;
    result.breakGroup = subProcessor.breakGroup;
    try {
      result.result = await subProcessor.process(this.type, hostInfo) as HostInfo;
      this.logger.info('initHostInfo succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteInitHostInfoError, {
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

  public async execute(): Promise<any> {
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
    this.logger.info('initHostInfo started');
    result.break = this.groupProcessor.break;
    let hostInfo = this.ctx.hostInfo!.clone();
    for (const subProcessor of this.groupProcessor.subProcessors) {
      const subResult = await this.executeSub(subProcessor, hostInfo);
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
    if (result.success) this.ctx.hostInfo = hostInfo;
    this.logger.info(result.success ? 'initHostInfo succeed' : 'initHostInfo failed');
    return result;
  }
}
