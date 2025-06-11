import type { HostInfo } from './HostInfo';
import type { BaseProcessor } from '../../../src/core/new_processor/processor/BaseProcessor';

export interface RawHostInfoRewrite {
  field: string;
  value: string;
  operation: string;
}

export class HostInfoRewrite {
  field: string;
  value: string;
  operation: string;

  constructor(rawHostInfoRewrite: RawHostInfoRewrite, private processor: BaseProcessor) {
    this.field = rawHostInfoRewrite.field;
    this.value = rawHostInfoRewrite.value;
    this.operation = rawHostInfoRewrite.operation;
  }

  async rewrite(hostInfo: HostInfo) {
    if (this.operation === 'set') {
      switch (this.field) {
        case 'platform':
          hostInfo.platform = this.value;
          break;
        case 'platformId':
          hostInfo.platformId = this.value;
          break;
        default:
          this.processor.logger.warn(`Unknown field ${this.field} in HostInfoRewrite`);
          break;
      }
    }
    return hostInfo;
  }
}
