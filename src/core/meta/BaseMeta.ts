import type { ILogger } from '../../types';
import type { RouteContext } from '../RouteContext';
import type { BaseProcessor } from '../processor/BaseProcessor';

export abstract class BaseMeta<TContext extends RouteContext = RouteContext> {
  protected readonly type: string;
  protected readonly logger: ILogger;
  protected readonly ctx: TContext;
  protected readonly processor: BaseProcessor;
  protected readonly data: unknown;

  protected constructor(options: {
    type: string;
    ctx: TContext;
    logger: ILogger;
    processor: BaseProcessor;
    data: unknown;
  }) {
    this.type = options.type;
    this.logger = options.logger;
    this.ctx = options.ctx;
    this.processor = options.processor;
    this.data = options.data;
  }

  public abstract process(data?: unknown): Promise<unknown>;

  public abstract needProcess(): boolean;
}
