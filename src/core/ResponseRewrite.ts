import { ResponseRewriteOperation, ResponseRewriteType } from '../common/Enum';
import { Value } from './value';
import { Match } from './Match';
import type { ValueRawData } from './value';
import type { RouteContext } from './RouteContext';
import type { RawMatch } from './Match';
import { isNil } from 'lodash';
import type { BaseProcessor } from './processor';

export interface RawResponseRewrite<
  T extends string = ResponseRewriteType,
  O extends string = ResponseRewriteOperation,
> {
  // 覆写类型
  type: T;
  // 匹配字段
  field: string;
  // 覆写值
  value?: ValueRawData;
  // 操作
  operation: O;
  // match 配置，做更精细的匹配
  match?: RawMatch;
}

export class ResponseRewrite<
  T extends string = ResponseRewriteType,
  O extends string = ResponseRewriteOperation,
> {
  type: T;
  field: string;
  value: Value | null;
  operation: O;
  processor: BaseProcessor;
  match?: Match;

  constructor(raw: RawResponseRewrite<T, O>, processor: BaseProcessor) {
    this.type = raw.type;
    this.field = raw.field;
    this.value = raw.value ? new Value(raw.value, processor) : null;
    this.operation = raw.operation;
    this.processor = processor;
    this.match = raw.match ? new Match(raw.match, this.processor) : undefined;
  }

  async rewrite(response: Response, ctx: RouteContext): Promise<Response> {
    const extraMatch = this.match ? await this.match.match(ctx, this.processor.logger) : true;
    if (!extraMatch) {
      return response;
    }

    const value = this.value ? await this.value.get(ctx) : null;
    switch (this.type) {
      case ResponseRewriteType.HEADER:
        response = this.rewriteHeader(response, value as string | null);
        break;
      default:
        response = await this.extendRewrite(response, ctx, value);
        break;
    }
    return response;
  }

  protected async extendRewrite(response: Response, _ctx: RouteContext, _value: unknown): Promise<Response> {
    // 这里可以扩展其他类型的响应覆写
    return response;
  }

  private rewriteHeader(response: Response, value: string | null): Response {
    const headers = response.headers;
    switch (this.operation) {
      case ResponseRewriteOperation.SET:
        if (!isNil(value)) {
          headers.set(this.field, value);
        }
        break;
      case ResponseRewriteOperation.DELETE:
        headers.delete(this.field);
        break;
      case ResponseRewriteOperation.APPEND:
        if (!isNil(value)) {
          headers.append(this.field, value);
        }
        break;
      default:
        break;
    }
    return response;
  }
}
