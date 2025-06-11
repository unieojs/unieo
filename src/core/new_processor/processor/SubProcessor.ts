import type { RawProcessorData } from './BaseProcessor';
import { BaseProcessor } from './BaseProcessor';
import type { RouteContext } from '../../RouteContext';
import type { BaseMeta } from '../meta/BaseMeta';
import { getMetaConstructors } from '../meta/decorators';

export interface SubProcessorOptions extends RawProcessorData {
  breakGroup: boolean;
}

export class SubProcessor extends BaseProcessor {
  public readonly breakGroup: boolean;
  protected readonly metas = new Map<string, BaseMeta>();

  constructor(options: SubProcessorOptions) {
    super(options);
    this.breakGroup = options.breakGroup;
    const registeredMetas = getMetaConstructors();
    Object.keys(this.rawMeta).forEach(type => {
      if (!registeredMetas.has(type)) {
        this.logger.warn(`Meta type ${type} is not registered in processor ${this.name}`);
        return;
      }
      if (this.metas.has(type)) {
        this.logger.warn(`Meta type ${type} is already registered in processor ${this.name}`);
        return;
      }
      // 创建 Meta 实例并存储
      const MetaClass = registeredMetas.get(type)!;
      const meta = new MetaClass({
        type,
        logger: this.logger,
        data: this.rawMeta[type],
      });
      this.metas.set(type, meta);
    });
  }

  public async processMeta(type: string, ctx: RouteContext) {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return;
    }
    const meta = this.metas.get(type)!;
    return await meta.process(ctx);
  }

  public needProcessMeta(type: string): boolean {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return false;
    }
    return this.metas.get(type)!.needProcess();
  }
}
