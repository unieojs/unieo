import { RouteExecutor } from './executor';
import { MetaType } from './meta';
import type { RouteContext } from './RouteContext';

export class CommonRouteExecutor<T extends RouteContext> extends RouteExecutor<T> {
  public async redirect() {
    await this.executeMeta(MetaType.REDIRECT);
  }

  public async requestRewrite() {
    await this.executeMeta(MetaType.REQUEST_REWRITE);
  }

  public async responseRewrite() {
    await this.executeMeta(MetaType.RESPONSE_REWRITE);
  }

  public async request() {
    return this.ctx.runMiddleware();
  }

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
