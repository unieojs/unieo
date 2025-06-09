import { GroupProcessorType } from '../../common/Enum';
import type {
  BaseRouteConfigArgs,
  BaseRouteConfigMeta,
  GroupProcessor,
  GroupRouteConfig,
  RawMatch,
  RouteContext,
  SubProcessor,
} from '../../core';
import { Match } from '../../core';
import type { ILogger, RouteHelper } from '../../types';

interface CommonGroupProcessorRouteConfigMeta extends BaseRouteConfigMeta {
  match?: RawMatch;
  isBreak?: boolean;
  // Legacy compatibility field for break configuration
  break?: boolean;
}

type CommonGroupProcessorRouteConfigArgs = BaseRouteConfigArgs;

export interface RawCommonGroupProcessor<
  M extends CommonGroupProcessorRouteConfigMeta = CommonGroupProcessorRouteConfigMeta,
  A extends CommonGroupProcessorRouteConfigArgs = CommonGroupProcessorRouteConfigArgs,
> {
  ctx: RouteContext;
  routeConfig: GroupRouteConfig<M, A>;
  subProcessors: SubProcessor[];
  logger: ILogger;
}

export class CommonGroupProcessor<
  M extends CommonGroupProcessorRouteConfigMeta = CommonGroupProcessorRouteConfigMeta,
  A extends CommonGroupProcessorRouteConfigArgs = CommonGroupProcessorRouteConfigArgs,
>
implements GroupProcessor<CommonGroupProcessorRouteConfigMeta, CommonGroupProcessorRouteConfigArgs> {
  public static readonly processorType = GroupProcessorType.COMMON_GROUP_PROCESSOR;

  public readonly ctx: RouteContext;
  public readonly name: string;
  public readonly type: string;
  public readonly break: boolean;
  public readonly subProcessors: SubProcessor[];
  public readonly match?: Match;
  public readonly logger: ILogger;
  public readonly meta: M;
  public readonly args: A;
  public readonly needRedirect: boolean;
  public readonly needBeforeRequest: boolean;
  public readonly needBeforeResponse: boolean;

  protected constructor(rawData: RawCommonGroupProcessor<M, A>) {
    const { ctx, logger, routeConfig } = rawData;
    this.ctx = ctx;
    this.logger = logger;
    this.name = routeConfig.name;
    this.type = routeConfig.type;
    this.break = !!(routeConfig.meta?.isBreak ?? routeConfig.meta?.break);
    this.subProcessors = rawData.subProcessors;
    if (routeConfig.meta?.match) {
      this.match = new Match(routeConfig.meta.match, this);
    }
    this.meta = routeConfig.meta;
    this.args = routeConfig.args ?? {} as A;
    this.needRedirect = this.subProcessors.some(item => item.needRedirect);
    this.needBeforeRequest = this.subProcessors.some(item => item.needBeforeRequest);
    this.needBeforeResponse = this.subProcessors.some(item => item.needBeforeResponse);
  }

  public static create(
    ctx: RouteContext,
    groupRouteConfig: GroupRouteConfig,
    subProcessors: SubProcessor[],
    helper: RouteHelper,
  ): CommonGroupProcessor {
    return new CommonGroupProcessor({
      ctx,
      routeConfig: groupRouteConfig,
      subProcessors,
      logger: helper.logger,
    });
  }

  public async checkMatch(): Promise<boolean> {
    if (!this.match) {
      return true;
    }
    return this.match.match(this.ctx, this.logger);
  }
}
