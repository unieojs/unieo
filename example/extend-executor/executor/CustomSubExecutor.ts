import { ExecuteResult, RouteContext, SubExecutor } from '../../../src';
import { CustomSubProcessor } from '../processor/sub/CustomSubProcessor';
import { HostInfo } from '../core/HostInfo';
import { ErrorCode, genError } from '../../../src/common/Error';

export class CustomSubExecutor extends SubExecutor {
  readonly subProcessor: CustomSubProcessor;

  constructor(subProcessor: CustomSubProcessor, options: {
    ctx: RouteContext;
  }) {
    super(subProcessor, options);
    this.subProcessor = subProcessor;
  }

  public async rewriteHostInfo(hostInfo: HostInfo): Promise<ExecuteResult<HostInfo>> {
    const result = {
      success: true,
      break: false,
      breakGroup: false,
      result: hostInfo,
    };
    if (!this.subProcessor.needRewriteHostInfo) {
      return result;
    }
    const matchResult = await this.subProcessor.checkMatch();
    if (!matchResult) {
      this.logger.info('not match, skipped');
      return result;
    }
    this.logger.info('initHostInfo started');
    result.break = this.subProcessor.break;
    result.breakGroup = this.subProcessor.breakGroup;
    try {
      result.result = await this.subProcessor.rewriteHostInfo(hostInfo);
      this.logger.info('initHostInfo succeed');
    } catch (err) {
      const error = genError(ErrorCode.SubRouteInitHostInfoError, {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      this.ctx.logError(error);
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
