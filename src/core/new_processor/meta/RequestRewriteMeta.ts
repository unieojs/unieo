import { BaseMeta } from './BaseMeta';
import { ExecuteResult } from '../executor/BaseExecutor';

export interface RequestRewriteMetaData {
  headers: Map<string, string>;
  body: any;
  method: string;
}

export class RequestRewriteMeta extends BaseMeta {
  private readonly data: RequestRewriteMetaData;

  constructor(options: {
    name: string;
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: RequestRewriteMetaData;
  }) {
    super(options);
    this.data = options.data;
  }

  public async execute(): Promise<ExecuteResult> {
    try {
      const request = this.ctx.request.clone();
      const rewrittenRequest = await this.rewriteRequest(request);
      return {
        success: true,
        break: false,
        breakGroup: false,
        result: rewrittenRequest
      };
    } catch (error) {
      this.logger.error('Request rewrite failed:', error);
      return {
        success: false,
        break: false,
        breakGroup: false
      };
    }
  }

  private async rewriteRequest(request: Request): Promise<Request> {
    const newHeaders = new Headers(request.headers);
    this.data.headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });

    return new Request(request.url, {
      method: this.data.method || request.method,
      headers: newHeaders,
      body: this.data.body || request.body,
      redirect: request.redirect,
      signal: request.signal,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      integrity: request.integrity
    });
  }
} 