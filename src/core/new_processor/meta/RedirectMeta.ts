import type { ILogger } from '../../../types';
import type { RawRedirect, Redirect } from '../../Redirect';
import type  { RouteContext } from '../../RouteContext';
import { BaseMeta } from './BaseMeta';

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

  public static create(
    options: {
      type: string;
      logger: ILogger;
      data: RawRedirect[];
    },
  ): RedirectMeta {
    return new RedirectMeta(options);
  }

  public async execute(ctx: RouteContext): Promise<Response | null> {
    for (const redirect of this.redirects) {
      const res = await redirect.redirect(ctx);
      if (res) {
        // 重定向生效，跳过后续
        return res;
      }
    }
    return null;
  }

  public onSuccess(result: Response, ctx: RouteContext) {
    ctx.setResponse(result);
  }

  public needExecute(): boolean {
    return this.redirects.length > 0;
  }
}
