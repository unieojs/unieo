import type { RouteProcessor } from '../processor';
import type { RouteContext } from '../RouteContext';
import { ErrorCode, genError } from '../../common/Error';
import { ExecutorFactory } from './Factory';

export class RouteExecutor {
  private readonly routeProcessor: RouteProcessor;
  private readonly ctx: RouteContext;

  constructor(options: {
    routeProcessor: RouteProcessor;
    ctx: RouteContext;
  }) {
    this.routeProcessor = options.routeProcessor;
    this.ctx = options.ctx;
  }

  public async execute(type: string): Promise<void> {
    if (!type) {
      throw genError(ErrorCode.SystemError, 'No meta type found in request headers');
    }

    for (const groupProcessor of this.routeProcessor.groupProcessors) {
      const groupExecutor = ExecutorFactory.create(type, { ctx: this.ctx, groupProcessor });
      const result = await groupExecutor.execute();
      if (result.break) {
        break;
      }
    }
  }
}
