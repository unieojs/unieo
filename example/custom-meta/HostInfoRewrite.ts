import type { HostInfo } from './HostInfo';
import type { BaseProcessor } from '../../src/core/processor/BaseProcessor';
import type { ValueRawData } from '../../src';
import { Value } from '../../src';
import type { CustomContext } from './CustomContext';

export interface RawHostInfoRewrite {
  field: string;
  value: ValueRawData;
  operation: string;
}

export class HostInfoRewrite {
  field: string;
  value: ValueRawData;
  operation: string;
  processor: BaseProcessor;

  constructor(rawHostInfoRewrite: RawHostInfoRewrite, processor: BaseProcessor) {
    this.field = rawHostInfoRewrite.field;
    this.value = rawHostInfoRewrite.value;
    this.operation = rawHostInfoRewrite.operation;
    this.processor = processor;
  }

  async rewrite(hostInfo: HostInfo, ctx: CustomContext) {
    const value = await new Value(this.value, this.processor).get(ctx);
    if (this.operation === 'set') {
      switch (this.field) {
        case 'platform':
          hostInfo.platform = value as string;
          break;
        case 'platformId':
          hostInfo.platformId = value as string;
          break;
        default:
          this.processor.logger.warn(`Unknown field ${this.field} in HostInfoRewrite`);
          break;
      }
    }
    return hostInfo;
  }
}
