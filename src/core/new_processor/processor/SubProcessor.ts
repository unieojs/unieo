import type { RawProcessorData } from './BaseProcessor';
import { BaseProcessor } from './BaseProcessor';
import type { RouteContext } from '../../RouteContext';
import type { BaseMeta } from '../meta/BaseMeta';
import { MetaManager } from '../meta/MetaManager';

export interface SubProcessorOptions extends RawProcessorData {
  breakGroup: boolean;
}

export class SubProcessor extends BaseProcessor {
  private readonly breakGroup: boolean;
  protected readonly metas = new Map<string, BaseMeta>();

  constructor(options: SubProcessorOptions) {
    super(options);
    this.breakGroup = options.breakGroup;
    Object.keys(this.rawMeta).forEach(type => {
      this.metas.set(type, MetaManager.getInstance().create({
        type,
        logger: this.logger,
        data: this.rawMeta[type],
      }));
    });
  }

  public async executeMeta(type: string, ctx: RouteContext) {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return;
    }
    const meta = this.metas.get(type)!;
    return await meta.execute(ctx);
  }

  public needExecuteMeta(type: string): boolean {
    if (!this.metas.has(type)) {
      this.logger.warn(`Meta type ${type} not found in processor ${this.name}`);
      return false;
    }
    return this.metas.get(type)!.needExecute();
  }
}
