import type { ILogger } from '../../../types';
import type { RouteContext } from '../../RouteContext';
import type { BaseProcessor } from '../processor/BaseProcessor';

export abstract class BaseMeta {
  protected readonly type: string;
  protected readonly logger: ILogger;

  protected constructor(options: {
    type: string;
    logger: ILogger;
    processor: BaseProcessor
    data: unknown;
  }) {
    this.type = options.type;
    this.logger = options.logger;
  }

  public abstract process(ctx: RouteContext): Promise<unknown>;

  public abstract needProcess(): boolean;
}
