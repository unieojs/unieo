import { RouteExecutor } from './RouteExecutor';
import { MetaType } from '../meta';
import type { RouteContext } from '../RouteContext';

export abstract class BaseRouteExecutor<T extends RouteContext> extends RouteExecutor<T> {
  protected async redirect() {
    await this.executeMeta(MetaType.REDIRECT);
  }

  protected async requestRewrite() {
    await this.executeMeta(MetaType.REQUEST_REWRITE);
  }

  protected async responseRewrite() {
    await this.executeMeta(MetaType.RESPONSE_REWRITE);
  }

  protected async request() {
    return this.ctx.runMiddleware();
  }
}
