import { CommonSubProcessor, CommonSubProcessorRouteConfigMeta, RawCommonSubProcessor } from '../../../../src';
import { HostInfoRewrite, RawHostInfoRewrite } from '../../core/HostInfoRewrite';
import { HostInfo } from '../../core/HostInfo';

interface CustomSubProcessorRouteConfigMeta extends CommonSubProcessorRouteConfigMeta {
  hostInfoRewrites?: RawHostInfoRewrite[];
}

interface RawCustomSubProcessor extends RawCommonSubProcessor<CustomSubProcessorRouteConfigMeta> {
}

export class CustomSubProcessor extends CommonSubProcessor<CustomSubProcessorRouteConfigMeta> {
  public readonly hostInfoRewrites: HostInfoRewrite[];
  public readonly needRewriteHostInfo: boolean;

  protected constructor(raw: RawCustomSubProcessor) {
    super(raw);
    const { routeConfig } = raw;
    this.hostInfoRewrites = (routeConfig.meta?.hostInfoRewrites || []).map(item => new HostInfoRewrite(item, this));
    this.needRewriteHostInfo = this.hostInfoRewrites.length > 0;
  }

  public async rewriteHostInfo(hostInfo: HostInfo) {
    // 1. hostInfoRewrite
    for (const hostInfoRewrite of this.hostInfoRewrites) {
      hostInfo = await hostInfoRewrite.rewrite(hostInfo);
    }
    return hostInfo;
  }
}
