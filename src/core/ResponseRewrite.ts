import { ResponseRewriteOperation, ResponseRewriteType } from '../common/Enum';
import { Value } from './Value';
import { Match } from './Match';
import type { ValueRawData } from './Value';
import type { RouteContext } from './RouteContext';
import type { RawMatch } from './Match';
import { isNil } from 'lodash';
import type { BaseProcessor } from './new_processor/processor/BaseProcessor';

export interface RawResponseRewrite {
  // 覆写类型
  type: ResponseRewriteType;
  // 匹配字段
  field: string;
  // 覆写值
  value?: ValueRawData;
  // 操作
  operation: ResponseRewriteOperation;
  // match 配置，做更精细的匹配
  match?: RawMatch;
}

export class ResponseRewrite {
  type: ResponseRewriteType;
  field: string;
  value: Value | null;
  operation: ResponseRewriteOperation;
  processor: BaseProcessor;
  match?: Match;

  constructor(raw: RawResponseRewrite, processor: BaseProcessor) {
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
        break;
    }
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
