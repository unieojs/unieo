import type { RouteExecutor } from './executor/RouteExecutor';
import type { RouteContext } from '../RouteContext';

export class PackRouteExecutor {
  private routeExecutor: RouteExecutor;
  private readonly ctx: RouteContext;

  constructor(options: {
    routeExecutor: RouteExecutor;
    ctx: RouteContext;
  }) {
    this.routeExecutor = options.routeExecutor;
    this.ctx = options.ctx;
  }

  public async redirect() {
    await this.routeExecutor.execute('redirects');
  }

  public async beforeRequest() {
    await this.routeExecutor.execute('requestRewrites');
  }

  public async beforeResponse() {
    await this.routeExecutor.execute('beforeResponse');
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
    await this.beforeRequest();
    if (!this.ctx.response) {
      await this.request();
    }
    // before response
    await this.beforeResponse();
  }
}
