import { CustomGroupProcessor } from './extend-executor/processor/group/CustomGroupProcessor';
import { CustomSubProcessor } from './extend-executor/processor/sub/CustomSubProcessor';
import { ERPerformance } from '../src/core/ERPerformance';
import { ERFetchEvent, HttpClient, ILogger } from '../src/types';
import { GroupRouteConfig } from '../src';
import { ProcessorFactory } from '../src/processor/Factory';
import { CustomRouteExecutor } from './extend-executor/executor/CustomRouteExecutor';
import { CustomContext } from './extend-executor/core/CustomContext';

interface RouteRawData {
  event: ERFetchEvent;
  logger?: ILogger;
  httpClient?: HttpClient;
  performance?: ERPerformance;
}

export class Route {
  readonly #ctx: CustomContext;
  readonly #processorFactory: ProcessorFactory;

  constructor(data: RouteRawData) {
    this.#ctx = new CustomContext({
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
    this.#processorFactory.registerGroupProcessor(CustomGroupProcessor.processorType, CustomGroupProcessor.create);
    this.#processorFactory.registerSubProcessor(CustomSubProcessor.processorType, CustomSubProcessor.create);
  }

  async execute(routes: GroupRouteConfig[]) {
    const processor = this.#processorFactory.createRouteProcessor<CustomGroupProcessor>(this.ctx, {
      routes,
    });
    const executor = new CustomRouteExecutor(processor, { ctx: this.#ctx });
    await executor.rewriteHostInfo();
    await executor.execute();
    return this.#ctx.response;
  }
}
