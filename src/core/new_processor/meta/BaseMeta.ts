import type { ILogger } from '../../../types';
import type { RouteContext } from '../../RouteContext';

export type MetaCreator = (options: {
  type: string;
  logger: ILogger;
  data: any;
}) => BaseMeta;

export abstract class BaseMeta {
  protected readonly type: string;
  protected readonly logger: ILogger;

  protected constructor(options: {
    type: string;
    logger: ILogger;
    data: unknown;
  }) {
    this.type = options.type;
    this.logger = options.logger;
  }

  public abstract execute(ctx: RouteContext): Promise<unknown>;

  public abstract needExecute(): boolean;
}
