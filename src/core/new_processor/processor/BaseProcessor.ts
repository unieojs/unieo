import type { RawMatch, RouteContext } from '../../../core';
import { Match } from '../../Match';
import type { ILogger } from '../../../types';
import { MetaManager } from '../meta/MetaManager';
import type { BaseMeta } from '../meta/BaseMeta';

export interface RawProcessorData {
  name: string;
  type: string;
  break: boolean;
  weakDep: boolean;
  logger: ILogger;
  ctx: RouteContext;
  meta: Record<string, unknown>; // 直接对应 Route JSON 中的 meta 字段
  args: object;
  match?: RawMatch;
}

export abstract class BaseProcessor {
  protected readonly name: string;
  protected readonly type: string;
  public readonly break: boolean;
  public readonly weakDep?: boolean;
  protected readonly logger: ILogger;
  protected readonly rawMeta: Record<string, unknown>;
  protected readonly match?: Match;

  protected constructor(data: RawProcessorData) {
    this.name = data.name;
    this.type = data.type;
    this.break = data.break;
    this.weakDep = data.weakDep;
    this.logger = data.logger;
    this.rawMeta = data.meta;
    if (data.match) {
      this.match = new Match(data.match, this);
    }
  }

  public async checkMatch(ctx: RouteContext): Promise<boolean> {
    if (!this.match) {
      return true;
    }
    return this.match.match(ctx, ctx.logger);
  }
}
