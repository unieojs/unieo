import type { RouteProcessor } from '../processor';
import type { RouteContext } from '../RouteContext';
import { ErrorCode, genError } from '../../common/Error';
import { ExecutorFactory } from './Factory';
import type { ExecuteResult } from './BaseExecutor';

export abstract class RouteExecutor<T extends RouteContext = RouteContext> {
  public readonly processor: RouteProcessor;
  protected readonly ctx: T;

  constructor(options: {
    processor: RouteProcessor;
    ctx: T;
  }) {
    this.processor = options.processor;
    this.ctx = options.ctx;
  }

  protected async executeMeta(type: string): Promise<ExecuteResult | undefined> {
    if (!type) {
      throw genError(ErrorCode.SystemError, 'No meta type found in request headers');
    }

    for (const groupProcessor of this.processor.groupProcessors) {
      const groupExecutor = ExecutorFactory.create(type, { ctx: this.ctx, groupProcessor });
      const result = await groupExecutor.execute();
      if (result.break) {
        return result;
      }
    }
  }

  abstract execute(): Promise<unknown>;
}
