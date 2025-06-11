import { Match } from '../Match';
import { isNil, isObject, isString } from 'lodash';
import type { RouteContext } from '../RouteContext';
import type { RawMatch } from '../Match';
import type { BaseProcessor } from '../new_processor/processor/BaseProcessor';

export interface IValueProcessor {
  getValue(value: unknown, ctx: RouteContext, processor: BaseProcessor): Promise<unknown>;
}

export class JsonValueProcessor implements IValueProcessor {
  async getValue<T extends object>(value: unknown): Promise<T | null> {
    try {
      return isObject(value) ? value as T : JSON.parse(value as string) as T;
    } catch (err) {
      // Error processing value, log error and return null
      console.error('Value processing failed:', err);
      return null;
    }
  }
}

export class StringValueProcessor implements IValueProcessor {
  async getValue(value: unknown): Promise<string | null> {
    return !isNil(value)
      ? isString(value) ? value : JSON.stringify(value)
      : null;
  }
}

export class NumberValueProcessor implements IValueProcessor {
  async getValue(value: unknown): Promise<number | null> {
    const res = Number(value);
    return isNaN(res) ? null : res;
  }
}

export class IntegerValueProcessor implements IValueProcessor {
  async getValue(value: unknown): Promise<number> {
    return parseInt(value as string, 10);
  }
}

export class BooleanValueProcessor implements IValueProcessor {
  async getValue(value: unknown): Promise<boolean> {
    return Boolean(value);
  }
}

export class MatchValueProcessor implements IValueProcessor {
  async getValue(value: RawMatch, ctx: RouteContext, processor: BaseProcessor): Promise<boolean> {
    // 如果 value 为空则直接返回 true
    if (!value) {
      return true;
    }
    const match = new Match(value, processor);
    return match.match(ctx, ctx.logger);
  }
}
