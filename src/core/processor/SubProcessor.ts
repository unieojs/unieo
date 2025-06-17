import type { RawMeta, RawProcessorData, RawRoute } from './BaseProcessor';
import { BaseProcessor } from './BaseProcessor';
import type { BaseMeta } from '../meta';
import { MetaFactory } from '../meta';
import type { RouteContext } from '../RouteContext';
import type { RouteHelper } from '../../types';
import type { SubProcessorType } from '../../common/Enum';

export interface SubProcessorRawMeta extends RawMeta {
  isBreakGroup?: boolean;
}

export interface SubRawRoute extends RawRoute {
  meta: SubProcessorRawMeta;
  processor: SubProcessorType.COMMON_SUB_PROCESSOR
}

export interface SubProcessorOptions extends RawProcessorData {
  route: SubRawRoute;
}

export class SubProcessor extends BaseProcessor {
  public readonly breakGroup: boolean;
  protected readonly metas = new Map<string, BaseMeta>();

  constructor(options: SubProcessorOptions) {
    super(options);
    const { route } = options;
    this.breakGroup = !!route.meta.isBreakGroup;

    // 使用 MetaFactory 创建 Meta 实例
    Object.keys(this.rawMeta).forEach(type => {
      if (!MetaFactory.isRegistered(type)) {
        this.logger.warn(`Meta type ${type} is not registered in processor ${this.name}`);
        return;
      }
      if (this.metas.has(type)) {
        this.logger.warn(`Meta type ${type} is already registered in processor ${this.name}`);
        return;
      }

      // 使用 MetaFactory 创建 Meta 实例
      const meta = MetaFactory.create(type, {
        logger: this.logger,
        ctx: this.ctx,
        data: this.rawMeta[type],
        processor: this,
      });
      this.metas.set(type, meta);
    });
  }

  public static create(ctx: RouteContext, route: SubRawRoute, helper: RouteHelper) {
    return new SubProcessor({
      ctx,
      route,
      logger: helper.logger,
    });
  }

  public async process(type: string, data?: unknown) {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return;
    }
    const meta = this.metas.get(type)!;
    return await meta.process(data);
  }

  public needProcess(type: string): boolean {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return false;
    }
    return this.metas.get(type)!.needProcess();
  }
}
