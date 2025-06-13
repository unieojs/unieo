import { RouteStatus } from '../../../common/Enum';
import type { RouteHelper } from '../../../types';
import { PrefixLogger } from '../../../util/PrefixLogger';
import { genError, ErrorCode } from '../../../common/Error';
import { RouteProcessor } from './RouteProcessor';

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

  public createRouteProcessor<T extends GroupProcessor = GroupProcessor>(
    ctx: RouteContext,
    routeConfig: RouteConfig,
  ): RouteProcessor<T> {
    const groupProcessors = routeConfig.routes
      ?.filter(routeConfigItem => {
        // Compatible with legacy configurations, only create non-OFFLINE routes
        const isOnline = routeConfigItem.status ? routeConfigItem.status !== RouteStatus.OFFLINE : true;
        return isOnline;
      })
      .map(groupRouteConfig => {
        return this.createGroupProcessor(ctx, groupRouteConfig);
      }) as T[];
    return new RouteProcessor<T>({
      groupProcessors,
      helper: this.helper,
    });
  }

  public createGroupProcessor(ctx: RouteContext, groupRouteConfig: GroupRouteConfig): GroupProcessor {
    const creator = this.groupProcessors.get(groupRouteConfig.processor);
    if (!creator) {
      throw genError(ErrorCode.GroupProcessorNotFoundError, `${groupRouteConfig.processor}`);
    }
    const helper = this.wrapHelper(this.helper, {
      loggerPrefix: `[group/${groupRouteConfig.name}]`,
    });
    const subProcessors = groupRouteConfig.routes
      ?.filter(routeConfigItem => {
        // Compatible with legacy configurations, only create non-OFFLINE routes
        const isOnline = routeConfigItem.status ? routeConfigItem.status !== RouteStatus.OFFLINE : true;
        return isOnline;
      })
      .map(subRouteConfig => {
        return this.createSubProcessor(ctx, subRouteConfig, helper);
      });

    return creator(ctx, groupRouteConfig, subProcessors, helper);
  }

  public createSubProcessor(ctx: RouteContext, subRouteConfig: SubRouteConfig, helper: RouteHelper): SubProcessor {
    const creator = this.subProcessors.get(subRouteConfig.processor);
    helper = this.wrapHelper(helper, {
      loggerPrefix: `[sub/${subRouteConfig.name}]`,
    });
    if (!creator) {
      throw genError(ErrorCode.SubProcessorNotFoundError, `${subRouteConfig.processor}`);
    }
    return creator(ctx, subRouteConfig, helper);
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
