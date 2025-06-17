import { RouteExecutor } from './executor';
import type { RouteContext } from './RouteContext';
import { MetaType } from './meta/enum';
import type { RouteProcessor } from './processor';

export class CommonRouteExecutor {
  private routeExecutor: RouteExecutor;
  private readonly ctx: RouteContext;

  constructor(options: {
    processor: RouteProcessor;
    ctx: RouteContext;
  }) {
    this.routeExecutor = new RouteExecutor({
      routeProcessor: options.processor,
      ctx: options.ctx,
    });
    this.ctx = options.ctx;
  }

  public async redirect() {
    await this.routeExecutor.execute(MetaType.REDIRECT);
  }

  public async requestRewrite() {
    await this.routeExecutor.execute(MetaType.REQUEST_REWRITE);
  }

  public async responseRewrite() {
    await this.routeExecutor.execute(MetaType.RESPONSE_REWRITE);
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
