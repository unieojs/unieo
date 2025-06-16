import type { ILogger } from '../../../types';
import type { RouteContext } from '../../RouteContext';
import { BaseMeta } from './BaseMeta';
import type { BaseProcessor } from '../processor';
import type { RawResponseRewrite } from '../../ResponseRewrite';
import { ResponseRewrite } from '../../ResponseRewrite';

export class ResponseRewriteMeta extends BaseMeta {
  private readonly responseRewrites: ResponseRewrite[];

  constructor(options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RawResponseRewrite[];
    processor: BaseProcessor;
  }) {
    super(options);
    this.responseRewrites = options.data.map(raw => new ResponseRewrite(raw, options.processor));
  }

  public async process(response: Response): Promise<Response> {
    for (const responseRewrite of this.responseRewrites) {
      response = await responseRewrite.rewrite(response, this.ctx);
    }
    return response;
  }

  public needProcess(): boolean {
    return this.responseRewrites.length > 0;
  }
}
