import type { ILogger } from '../../../types';
import type { RouteContext } from '../../RouteContext';
import { BaseMeta } from '../BaseMeta';
import type { BaseProcessor } from '../../processor';
import type { RawRequestRewrite } from '../../RequestRewrite';
import { RequestRewrite } from '../../RequestRewrite';

export class RequestRewriteMeta extends BaseMeta {
  private readonly requestRewrites: RequestRewrite[];

  constructor(options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RawRequestRewrite[];
    processor: BaseProcessor;
  }) {
    super(options);
    this.requestRewrites = options.data.map(raw => new RequestRewrite(raw, options.processor));
  }

  public async process(request: Request): Promise<Request> {
    for (const requestRewrite of this.requestRewrites) {
      request = await requestRewrite.rewrite(request, this.ctx);
    }
    return request;
  }

  public needProcess(): boolean {
    return this.requestRewrites.length > 0;
  }
}
