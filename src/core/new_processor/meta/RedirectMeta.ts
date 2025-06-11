import type { ILogger } from '../../../types';
import type { RawRedirect, Redirect } from '../../Redirect';
import type { RouteContext } from '../../RouteContext';
import { BaseMeta } from './BaseMeta';
import { RouteMeta } from './decorators';

@RouteMeta('redirects')
export class RedirectMeta extends BaseMeta {
  private readonly redirects: Redirect[];

  constructor(options: {
    type: string;
    logger: ILogger;
    data: RawRedirect[];
  }) {
    super(options);
    this.redirects = options.data.map(raw => new Redirect(raw));
  }

  public async process(ctx: RouteContext): Promise<Response | undefined> {
    for (const redirect of this.redirects) {
      const res = await redirect.redirect(ctx);
      if (res) {
        // 重定向生效，跳过后续
        return res;
      }
    }
  }

  public needProcess(): boolean {
    return this.redirects.length > 0;
  }
}
