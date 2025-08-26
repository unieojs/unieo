import { BaseRouteExecutor } from './executor';
import type { RouteContext } from './RouteContext';

export class CommonRouteExecutor<T extends RouteContext> extends BaseRouteExecutor<T> {
  public async execute() {
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
