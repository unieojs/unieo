import type { GroupRawRoute } from './core';
import { GroupProcessor, ProcessorFactory, RouteContext, SubProcessor } from './core';
import { ERPerformance } from './core/ERPerformance';
import type { ERFetchEvent, HttpClient, ILogger } from './types';
import type { MiddlewareGen } from './middleware';
import { GroupProcessorType, SubProcessorType } from './common/Enum';
import { CommonRouteExecutor } from './core/CommonRouteExecutor';

interface RouteRawData {
  event: ERFetchEvent;
  logger?: ILogger;
  httpClient?: HttpClient;
  performance?: ERPerformance;
  middlewares?: [string, MiddlewareGen][];
}

export class Route {
  readonly #ctx: RouteContext;
  readonly #processorFactory: ProcessorFactory;

  constructor(data: RouteRawData) {
    this.#ctx = new RouteContext({
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
  }

  get ctx() {
    return this.#ctx;
  }

  private registerProcessor() {
    this.#processorFactory.registerGroupProcessor(GroupProcessorType.COMMON_GROUP_PROCESSOR, GroupProcessor.create);
    this.#processorFactory.registerSubProcessor(SubProcessorType.COMMON_SUB_PROCESSOR, SubProcessor.create);
  }

  async execute(routes: GroupRawRoute[]) {
    const processor = this.#processorFactory.createRouteProcessor(this.ctx, {
      routes,
    });
    const executor = new CommonRouteExecutor({
      processor,
      ctx: this.#ctx,
    });
    await executor.execute();
    return this.#ctx.response;
  }
}
