import type { RawProcessorData, RawRoute } from './BaseProcessor';
import { BaseProcessor } from './BaseProcessor';
import type { SubProcessor, SubRawRoute } from './SubProcessor';
import type { RouteContext } from '../../RouteContext';
import type { RouteHelper } from '../../../types';
import type { GroupProcessorType } from '../../../common/Enum';

export interface GroupRawRoute extends RawRoute {
  processor: GroupProcessorType.COMMON_GROUP_PROCESSOR;
  routes: SubRawRoute[];
}

export interface RawGroupProcessorData extends RawProcessorData {
  subProcessors: SubProcessor[];
  route: GroupRawRoute;
}

export class GroupProcessor extends BaseProcessor {
  public readonly subProcessors: SubProcessor[];

  constructor(data: RawGroupProcessorData) {
    super(data);
    this.subProcessors = data.subProcessors;
  }

  public static create(
    ctx: RouteContext,
    route: GroupRawRoute,
    subProcessors: SubProcessor[],
    helper: RouteHelper,
  ) {
    return new GroupProcessor({
      ctx,
      route,
      logger: helper.logger,
      subProcessors,
    });
  }

  public needProcess(type: string): boolean {
    return this.subProcessors.some(sp => sp.needProcess(type));
  }
}
