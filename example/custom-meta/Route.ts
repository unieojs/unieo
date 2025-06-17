import type { GroupRawRoute, MiddlewareGen } from '../../src';
import { ExecutorFactory, GroupProcessor, MetaFactory, ProcessorFactory, SubProcessor } from '../../src';
import type { ERFetchEvent, HttpClient, ILogger } from '../../src/types';
import { ERPerformance } from '../../src/core/ERPerformance';
import { GroupProcessorType, SubProcessorType } from '../../src/common/Enum';
import { HostInfoRewriteMeta } from './HostInfoRewriteMeta';
import { HostInfoRewriteExecutor } from './HostInfoRewriteExecutor';
import { CustomContext } from './CustomContext';
import { HostInfo } from './HostInfo';
import { CustomRouteExecutor } from './CustomRouteExecutor';

interface RouteRawData {
  event: ERFetchEvent;
  logger?: ILogger;
  httpClient?: HttpClient;
  performance?: ERPerformance;
  middlewares?: [string, MiddlewareGen][];
}

export class Route {
  readonly #ctx: CustomContext;
  readonly #processorFactory: ProcessorFactory;

  constructor(data: RouteRawData) {
    this.#ctx = new CustomContext({
      event: data.event,
      request: data.event.request,
      performance: data.performance ?? new ERPerformance(),
      middlewares: data.middlewares,
      helper: {
        logger: data.logger ?? console,
        httpClient: data.httpClient ?? {
          request: async (request, options) => {
            return fetch(request, options);
          },
        },
      },
    });
    this.#processorFactory = new ProcessorFactory(this.ctx);
    this.registerProcessor();
    this.registerMeta();
    this.initHostInfo();
  }

  get ctx() {
    return this.#ctx;
  }

  private initHostInfo() {
    if (this.#ctx.hostInfo) {
      this.#ctx.hostInfo.platform = 'custom';
      this.#ctx.hostInfo.platformId = 'customId';
    }
    this.#ctx.hostInfo = new HostInfo('custom', 'customId');
  }

  private registerMeta() {
    MetaFactory.register('hostInfoRewrites', HostInfoRewriteMeta);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ExecutorFactory.register('hostInfoRewrites', HostInfoRewriteExecutor as any);
  }

  private registerProcessor() {
    this.#processorFactory.registerGroupProcessor(GroupProcessorType.COMMON_GROUP_PROCESSOR, GroupProcessor.create);
    this.#processorFactory.registerSubProcessor(SubProcessorType.COMMON_SUB_PROCESSOR, SubProcessor.create);
  }

  async execute(routes: GroupRawRoute[]) {
    const processor = this.#processorFactory.createRouteProcessor(this.ctx, {
      routes,
    });
    const executor = new CustomRouteExecutor({
      processor,
      ctx: this.#ctx,
    });
    await executor.execute();
    return this.#ctx.response;
  }
}
