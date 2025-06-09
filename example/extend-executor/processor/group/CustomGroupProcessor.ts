import { CommonGroupProcessor } from '../../../../src';
import { CustomSubProcessor } from '../sub/CustomSubProcessor';
import { RawCommonGroupProcessor } from '../../../../src/processor/group/CommonGroupProcessor';

interface RawCustomGroupProcessor extends RawCommonGroupProcessor {
  subProcessors: CustomSubProcessor[];
}

export class CustomGroupProcessor extends CommonGroupProcessor {
  readonly subProcessors: CustomSubProcessor[];
  needRewriteHostInfo: boolean;

  constructor(raw: RawCustomGroupProcessor) {
    super(raw);
    this.subProcessors = raw.subProcessors;
    this.needRewriteHostInfo = this.subProcessors.some(processor => processor.needRewriteHostInfo)
  }
}
