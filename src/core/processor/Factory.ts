import type { GroupProcessorType, SubProcessorType } from '../../common/Enum';
import { RouteStatus } from '../../common/Enum';
import type { RouteContext } from '..';
import { RouteProcessor } from '..';
import type { RouteHelper } from '../../types';
import { PrefixLogger } from '../../util/PrefixLogger';
import { ErrorCode, genError } from '../../common/Error';
import type { SubProcessor, SubRawRoute } from './SubProcessor';
import type { GroupProcessor, GroupRawRoute } from './GroupProcessor';

export interface RouteConfig {
  routes: GroupRawRoute[];
}

export type GroupProcessorCreator = (
  ctx: RouteContext,
  route: GroupRawRoute,
  subProcessor: SubProcessor[],
  helper: RouteHelper,
) => GroupProcessor;

export type SubProcessorCreator = (
  ctx: RouteContext,
  route: SubRawRoute,
  helper: RouteHelper,
) => SubProcessor;

export class ProcessorFactory {
  private readonly groupProcessors = new Map<GroupProcessorType, GroupProcessorCreator>();
  private readonly subProcessors = new Map<SubProcessorType, SubProcessorCreator>();
  private readonly helper: RouteHelper;

  constructor(RouteHelper: RouteHelper) {
    this.helper = RouteHelper;
  }

  registerGroupProcessor(type: GroupProcessorType, creator: GroupProcessorCreator) {
    this.groupProcessors.set(type, creator);
  }

  registerSubProcessor(type: SubProcessorType, creator: SubProcessorCreator) {
    this.subProcessors.set(type, creator);
  }

  public createRouteProcessor(
    ctx: RouteContext,
    routeConfig: RouteConfig,
  ): RouteProcessor {
    const groupProcessors = routeConfig.routes
      ?.filter(routeConfigItem => {
        // Compatible with legacy configurations, only create non-OFFLINE routes
        return routeConfigItem.status ? routeConfigItem.status !== RouteStatus.OFFLINE : true;
      })
      .map(groupRouteConfig => {
        return this.createGroupProcessor(ctx, groupRouteConfig);
      });
    return new RouteProcessor({
      groupProcessors,
    });
  }

  public createGroupProcessor(ctx: RouteContext, groupRoute: GroupRawRoute): GroupProcessor {
    const creator = this.groupProcessors.get(groupRoute.processor as GroupProcessorType);
    if (!creator) {
      throw genError(ErrorCode.GroupProcessorNotFoundError, `${groupRoute.processor}`);
    }
    const helper = this.wrapHelper(this.helper, {
      loggerPrefix: `[group/${groupRoute.name}]`,
    });
    const subProcessors = groupRoute.routes
      ?.filter(routeConfigItem => {
        // Compatible with legacy configurations, only create non-OFFLINE routes
        const isOnline = routeConfigItem.status ? routeConfigItem.status !== RouteStatus.OFFLINE : true;
        return isOnline;
      })
      .map(subRouteConfig => {
        return this.createSubProcessor(ctx, subRouteConfig, helper);
      });

    return creator(ctx, groupRoute, subProcessors, helper);
  }

  public createSubProcessor(ctx: RouteContext, subRoute: SubRawRoute, helper: RouteHelper): SubProcessor {
    const creator = this.subProcessors.get(subRoute.processor as SubProcessorType);
    helper = this.wrapHelper(helper, {
      loggerPrefix: `[sub/${subRoute.name}]`,
    });
    if (!creator) {
      throw genError(ErrorCode.SubProcessorNotFoundError, `${subRoute.processor}`);
    }
    return creator(ctx, subRoute, helper);
  }

  wrapHelper(
    helper: RouteHelper,
    options: {
      loggerPrefix: string;
    },
  ): RouteHelper {
    const wrappedHelper = Object.create(helper) as RouteHelper;
    const prefixLogger = new PrefixLogger(options.loggerPrefix, helper.logger);
    Object.defineProperty(wrappedHelper, 'logger', { value: prefixLogger });
    return wrappedHelper;
  }
}
