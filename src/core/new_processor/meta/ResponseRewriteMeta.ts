import { BaseMeta } from './BaseMeta';
import { ExecuteResult } from '../executor/BaseExecutor';

export interface ResponseRewriteMetaData {
  headers: Map<string, string>;
  body: any;
  status: number;
}

export class ResponseRewriteMeta extends BaseMeta {
  private readonly data: ResponseRewriteMetaData;

  constructor(options: {
    name: string;
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: ResponseRewriteMetaData;
  }) {
    super(options);
    this.data = options.data;
  }

  public async execute(): Promise<ExecuteResult> {
    try {
      const response = this.ctx.response?.clone();
      if (!response) {
        throw new Error('Response is undefined');
      }
      const rewrittenResponse = await this.rewriteResponse(response);
      return {
        success: true,
        break: false,
        breakGroup: false,
        result: rewrittenResponse
      };
    } catch (error) {
      this.logger.error('Response rewrite failed:', error);
      return {
        success: false,
        break: false,
        breakGroup: false
      };
    }
  }

  private async rewriteResponse(response: Response): Promise<Response> {
    const newHeaders = new Headers(response.headers);
    this.data.headers.forEach((value, key) => {
      newHeaders.set(key, value);
    });

    return new Response(this.data.body || response.body, {
      status: this.data.status || response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
} 