import type { ILogger } from '../../../types';
import type { RawRedirect } from '../../Redirect';
import { Redirect } from '../../Redirect';
import type { RouteContext } from '../../RouteContext';
import { BaseMeta } from '../BaseMeta';
import type { BaseProcessor } from '../../processor';
import type { ValueRawData } from '../../value';
import { Value } from '../../value';

export class RedirectMeta extends BaseMeta {
  private readonly redirects?: Redirect[];
  private readonly redirectValue?: Value<RawRedirect[]>;

  constructor(options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RawRedirect[] | ValueRawData;
    processor: BaseProcessor;
  }) {
    super(options);
    if (Array.isArray(options.data)) {
      this.redirects = options.data.map(raw => new Redirect(raw, options.processor));
    } else {
      this.redirectValue = new Value(options.data, options.processor);
    }
  }

  public async process(): Promise<Response | undefined> {
    let redirects = this.redirects;
    if (this.redirectValue) {
      const rawRedirects = await this.redirectValue.get(this.ctx);
      redirects = rawRedirects.map(raw => new Redirect(raw, this.processor));
    }
    if (!redirects) {
      return;
    }
    for (const redirect of redirects) {
      const res = await redirect.redirect(this.ctx);
      if (res) {
        // 重定向生效，跳过后续
        return res;
      }
    }
  }

  public needProcess(): boolean {
    return ((this.redirects?.length ?? 0) > 0) || !!this.redirectValue;
  }
}
