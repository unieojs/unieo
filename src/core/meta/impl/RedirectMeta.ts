import type { ILogger } from '../../../types';
import type { RawRedirect } from '../../Redirect';
import { Redirect } from '../../Redirect';
import type { RouteContext } from '../../RouteContext';
import { BaseMeta } from '../BaseMeta';
import type { BaseProcessor } from '../../processor';

export class RedirectMeta extends BaseMeta {
  private readonly redirects: Redirect[];

  constructor(options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RawRedirect[];
    processor: BaseProcessor;
  }) {
    super(options);
    this.redirects = options.data.map(raw => new Redirect(raw, options.processor));
  }

  public async process(): Promise<Response | undefined> {
    for (const redirect of this.redirects) {
      const res = await redirect.redirect(this.ctx);
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
