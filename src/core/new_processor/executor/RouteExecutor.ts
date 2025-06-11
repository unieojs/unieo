import type { RouteProcessor } from '../processor/RouteProcessor';
import type { RouteContext } from '../../RouteContext';
import { getGroupExecutors } from './decorators';
import { ErrorCode, genError } from '../../../common/Error';

export class RouteExecutor {
  private readonly routeProcessor: RouteProcessor;

  constructor(options: {
    routeProcessor: RouteProcessor;
  }) {
    this.routeProcessor = options.routeProcessor;
  }

  public async executeMeta(ctx: RouteContext): Promise<void> {
    const type = ctx.request.headers.get('x-meta-type');
    if (!type) {
      throw genError(ErrorCode.SystemError, 'No meta type found in request headers');
    }

    const registeredExecutors = getGroupExecutors();
    const ExecutorClass = registeredExecutors.get(type);

    if (!ExecutorClass) {
      throw genError(ErrorCode.SystemError, `No executor found for type: ${type}`);
    }

    for (const groupProcessor of this.routeProcessor.groupProcessors) {
      const groupExecutor = new ExecutorClass({ groupProcessor });
      const result = await groupExecutor.execute(ctx);

      if (!result.success) {
        throw genError(ErrorCode.SystemError, 'execute meta failed');
      }

      if (result.break) {
        break;
      }
    }
  }
}
