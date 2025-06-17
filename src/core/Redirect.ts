import { Match } from './Match';
import { RedirectHelper } from '../util/RedirectHelper';
import type { RouteContext } from './RouteContext';
import type { RawMatch } from './Match';
import type { RedirectData } from '../util/RedirectHelper';
import type { BaseProcessor } from './processor';

export interface RawRedirect extends RedirectData {
  // match 配置，做更精细的匹配
  match?: RawMatch;
}

export class Redirect {
  processor: BaseProcessor;
  match?: Match;
  redirectHelper: RedirectHelper;

  constructor(raw: RawRedirect, processor: BaseProcessor) {
    this.redirectHelper = new RedirectHelper(raw);
    this.processor = processor;
    this.match = raw.match ? new Match(raw.match, this.processor) : undefined;
  }

  async redirect(ctx: RouteContext): Promise<Response | null> {
    const extraMatch = this.match ? await this.match.match(ctx, this.processor.logger) : true;
    if (!extraMatch) {
      return null;
    }

    const result = this.redirectHelper.redirect(ctx.requestUrl);
    if (!result) {
      return null;
    }
    return new Response(null, {
      status: result.status,
      headers: {
        location: result.href,
      },
    });
  }
}
