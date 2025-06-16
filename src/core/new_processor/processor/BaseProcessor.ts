import type { RawMatch, RouteContext } from '../../../core';
import { Match } from '../../Match';
import type { ILogger } from '../../../types';
import type { RouteStatus } from '../../../common/Enum';

export interface RawMeta {
  match?: RawMatch; // 匹配规则
  isBreak?: boolean; // 是否中断后续处理
  break?: boolean; // 兼容旧版本的中断配置
  weakDep?: boolean;
  [key: string]: unknown; // 直接对应 Route JSON 中的 meta 字段
}

export interface RawRoute {
  name: string;
  type: string;
  status?: RouteStatus; // Legacy
  meta: RawMeta; // 直接对应 Route JSON 中的 meta 字段
  args: Record<string, unknown>;
}

export interface RawProcessorData {
  logger: ILogger;
  route: RawRoute;
  ctx: RouteContext;
}

export abstract class BaseProcessor {
  protected readonly name: string;
  protected readonly type: string;
  public readonly break: boolean;
  public readonly weakDep?: boolean;
  public readonly logger: ILogger;
  protected readonly ctx: RouteContext;
  protected readonly rawMeta: Record<string, unknown>;
  public args: Record<string, unknown>;
  protected readonly match?: Match;

  protected constructor(data: RawProcessorData) {
    const { route, ctx, logger } = data;
    this.name = route.name;
    this.type = route.type;
    this.break = !!(route.meta?.isBreak ?? route.meta?.break);
    this.weakDep = !!route.meta?.weakDep;
    this.logger = logger;
    this.ctx = ctx;
    this.rawMeta = route.meta;
    this.args = route.args;
    if (route.meta?.match) {
      this.match = new Match(route.meta?.match, this);
    }
  }

  public async checkMatch(): Promise<boolean> {
    if (!this.match) {
      return true;
    }
    return this.match.match(this.ctx, this.ctx.logger);
  }
}
