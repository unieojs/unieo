import type { RouteContext } from '../../src';
import { BaseRouteExecutor } from '../../src';

export class CustomRouteExecutor extends BaseRouteExecutor<RouteContext> {
  public async rewriteHostInfo() {
    await this.executeMeta('hostInfoRewrites');
  }

  public async execute() {
    // rewrite host info
    await this.rewriteHostInfo();
    // redirect
    await this.redirect();
    // redirect success, skip next
    if (this.ctx.response) {
      return;
    }
    // before request
    await this.requestRewrite();
    if (!this.ctx.response) {
      await this.request();
    }
    // before response
    await this.responseRewrite();
  }
}
