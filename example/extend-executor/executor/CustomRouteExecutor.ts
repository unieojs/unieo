import { CustomContext } from '../core/CustomContext';
import { RouteProcessor } from '../../../src/processor/RouteProcessor';
import { CustomGroupExecutor } from './CustomGroupExecutor';
import { CustomGroupProcessor } from '../processor/group/CustomGroupProcessor';
import { RouteExecutor } from '../../../src';

export class CustomRouteExecutor extends RouteExecutor {
  readonly ctx: CustomContext;
  readonly groupExecutors: CustomGroupExecutor[];
  readonly routeProcessor: RouteProcessor<CustomGroupProcessor>;

  constructor(routeProcessor: RouteProcessor<CustomGroupProcessor>, options: {
    ctx: CustomContext;
  }) {
    super(routeProcessor, options);
    this.ctx = options.ctx;
    this.routeProcessor = routeProcessor;
    this.groupExecutors = this.routeProcessor.groupProcessors.map(processor => new CustomGroupExecutor(processor, {
      ctx: this.ctx,
    }))
  }

  public async rewriteHostInfo() {
    for (const groupExecutor of this.groupExecutors) {
      const result = await groupExecutor.rewriteHostInfo();
      // break 为 true，跳过后面的 group 执行
      if (result.break) {
        break;
      }
    }
  }
}
