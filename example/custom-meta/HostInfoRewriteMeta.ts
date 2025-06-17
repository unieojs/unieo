import type { RawHostInfoRewrite } from './HostInfoRewrite';
import { HostInfoRewrite } from './HostInfoRewrite';
import type { HostInfo } from './HostInfo';
import type { BaseProcessor, RouteContext } from '../../src';
import { BaseMeta } from '../../src';
import type { ILogger } from '../../src/types';

export class HostInfoRewriteMeta extends BaseMeta {
  private readonly hostInfoRewrites: HostInfoRewrite[];

  constructor(options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RawHostInfoRewrite[];
    processor: BaseProcessor;
  }) {
    super(options);
    this.hostInfoRewrites = options.data.map(raw => new HostInfoRewrite(raw, options.processor));
  }

  public async process(hostInfo: HostInfo): Promise<HostInfo> {
    for (const hostInfoRewrite of this.hostInfoRewrites) {
      hostInfo = await hostInfoRewrite.rewrite(hostInfo);
    }
    return hostInfo;
  }

  public needProcess(): boolean {
    return this.hostInfoRewrites.length > 0;
  }
}
