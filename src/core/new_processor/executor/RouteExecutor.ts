import type { RouteProcessor } from '../processor/RouteProcessor';
import { GroupExecutor } from './GroupExecutor';
import type { RouteContext } from '../../RouteContext';

export class RouteExecutor {
  private readonly routeProcessor: RouteProcessor;
  private readonly groupExecutors: GroupExecutor[];

  constructor(options: {
    routeProcessor: RouteProcessor;
  }) {
    this.routeProcessor = options.routeProcessor;
    this.groupExecutors = this.routeProcessor.groupProcessors.map(groupProcessor => {
      return new GroupExecutor({
        groupProcessor,
      });
    });
  }

  public async executeMeta(type: string, ctx: RouteContext): Promise<void> {
    for (const groupExecutor of this.groupExecutors) {
      const result = await groupExecutor.executeMeta(type, ctx);
      // break 为 true，跳过后面的 group 执行
      if (result.break) {
        break;
      }
    }
  }
}
