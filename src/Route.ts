import { RouteContext } from './core';
import { ProcessorFactory } from './processor/Factory';
import { ERPerformance } from './core/ERPerformance';
import { CommonGroupProcessor, CommonSubProcessor } from './processor';
import { RouteExecutor } from './executor';
import type { GroupRouteConfig } from './core';
import type { ERFetchEvent, HttpClient, ILogger } from './types';

interface RouteRawData {
  event: ERFetchEvent;
  logger?: ILogger;
  httpClient?: HttpClient;
  performance?: ERPerformance;
}

export class Route {
  readonly #ctx: RouteContext;
  readonly #processorFactory: ProcessorFactory;

  constructor(data: RouteRawData) {
    this.#ctx = new RouteContext({
      event: data.event,
      request: data.event.request,
      performance: data.performance ?? new ERPerformance(),
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
    this.#processorFactory.registerGroupProcessor(CommonGroupProcessor.processorType, CommonGroupProcessor.create);
    this.#processorFactory.registerSubProcessor(CommonSubProcessor.processorType, CommonSubProcessor.create);
  }

  async execute(routes: GroupRouteConfig[]) {
    const processor = this.#processorFactory.createRouteProcessor(this.ctx, {
      routes,
    });
    const executor = new RouteExecutor(processor, { ctx: this.#ctx });
    await executor.execute();
    return this.#ctx.response;
  }
}
