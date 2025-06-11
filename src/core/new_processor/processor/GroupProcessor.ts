import type { RawProcessorData } from './BaseProcessor';
import { BaseProcessor } from './BaseProcessor';
import type { SubProcessor } from './SubProcessor';

export interface GroupProcessorOptions extends RawProcessorData {
  subProcessors: SubProcessor[];
}

export class GroupProcessor extends BaseProcessor {
  public readonly subProcessors: SubProcessor[];

  constructor(options: GroupProcessorOptions) {
    super(options);
    this.subProcessors = options.subProcessors;
  }

  public needProcessMeta(type: string): boolean {
    return this.subProcessors.some(sp => sp.needProcessMeta(type));
  }
}
