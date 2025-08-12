import { isArray, isNil, isObject, isString } from 'lodash-es';
import { match } from 'path-to-regexp';
import { MatchOperator, Operator, ValueType } from '../common/Enum';
import { Value } from './value';
import type { ILogger } from '../types';
import type { RouteContext } from './RouteContext';
import type { ValueRawData } from './value';
import type { BaseProcessor } from './processor';

export interface RawMatch {
  list: (RawMatchItem | RawMatch)[];
  operator?: MatchOperator;
}

export interface RawMatchItem {
  // 匹配字段
  origin: ValueRawData;
  // 对比值
  criteria?: ValueRawData;
  // 操作符
  operator: Operator;
}

export interface MatchItem {
  // 匹配字段
  origin: Value;
  // 对比值
  criteria?: Value;
  // 操作符
  operator: Operator;
}

export class Match {
  list: (MatchItem | Match)[];
  operator: MatchOperator;
  processor: BaseProcessor;

  constructor(raw: RawMatch, processor: BaseProcessor) {
    this.list = (raw.list ?? []).map(item => {
      if (this.isRawMatchItem(item)) {
        return {
          origin: new Value(item.origin, processor),
          criteria: item.criteria ? new Value(item.criteria, processor) : undefined,
          operator: item.operator,
        };
      }
      return new Match(item, processor);
    });
    this.operator = raw.operator ?? MatchOperator.AND;
    this.processor = processor;
  }

  /**
   * 将版本号长度对齐，每一个区间都是 10 位字符串，方便后续做字符串比较，如 10.5.8.001 会变成 0000000010.0000000005.0000000008.0000000001
   * @param version 版本号
   */
  private getPaddedAppVersion(version?: string): string {
    return (version ?? '').split('.').map(v => v.padStart(10, '0')).join('.');
  }

  async match(ctx: RouteContext, logger: ILogger): Promise<boolean> {
    // 默认是 true
    let result = true;
    for (const item of this.list) {
      if (item instanceof Match) {
        result = await item.match(ctx, this.processor.logger);
      } else {
        try {
          result = await this.matchItem(item, ctx);
        } catch (err) {
          const itemStr = JSON.stringify({
            origin: item.origin.toObject(),
            criteria: item.criteria ? item.criteria.toObject() : undefined,
            operator: item.operator,
          });
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error(`Match error, config: ${JSON.stringify(itemStr)}, error: ${errorMessage}`);
          result = false;
        }
      }
      if (this.operator === MatchOperator.AND && !result) {
        return false;
      }
      if (this.operator === MatchOperator.OR && result) {
        return true;
      }
    }
    return result;
  }

  async matchItem(matchItem: MatchItem, ctx: RouteContext): Promise<boolean> {
    const origin = await matchItem.origin.get(ctx);
    const criteria = matchItem.criteria ? await matchItem.criteria.get(ctx) : undefined;
    switch (matchItem.operator) {
      case Operator.EQUAL:
        return origin === criteria;
      case Operator.NOT_EQUAL:
        return origin !== criteria;
      case Operator.IN: {
        // 都取不到应当视为匹配未命中
        if (isNil(criteria) && isNil(origin)) {
          return false;
        }
        const formattedCriteria = isArray(criteria) ? criteria : [ criteria ];
        return formattedCriteria.includes(origin);
      }
      case Operator.NOT_IN: {
        // 都取不到应当视为匹配未命中
        if (isNil(criteria) && isNil(origin)) {
          return false;
        }
        const formattedCriteria = isArray(criteria) ? criteria : [ criteria ];
        return !formattedCriteria.includes(origin);
      }
      case Operator.NULL:
        return isNil(origin) || origin === '';
      case Operator.NOT_NULL:
        return !isNil(origin) && origin !== '';
      case Operator.REGEXP:
        return isString(criteria) && isString(origin) && new RegExp(criteria, 'i').test(origin);
      case Operator.NOT_REGEXP:
        return isString(criteria) && !(isString(origin) && new RegExp(criteria, 'i').test(origin));
      case Operator.PATH_REGEXP: {
        if (!isString(criteria)) {
          return false;
        }
        const pathMatch = match(criteria, { decode: decodeURIComponent });
        return !!pathMatch(ctx.path);
      }
      case Operator.NOT_PATH_REGEXP: {
        if (!isString(criteria)) {
          return false;
        }
        const pathMatch = match(criteria, { decode: decodeURIComponent });
        return !pathMatch(ctx.path);
      }
      case Operator.GTE: {
        if (matchItem.criteria?.valueType === ValueType.VERSION_STRING) {
          return this.getPaddedAppVersion(String(origin)) >= this.getPaddedAppVersion(String(criteria));
        }

        return (origin as number) >= (criteria as number);
      }
      case Operator.GT: {
        if (matchItem.criteria?.valueType === ValueType.VERSION_STRING) {
          return this.getPaddedAppVersion(String(origin)) > this.getPaddedAppVersion(String(criteria));
        }

        return (origin as number) > (criteria as number);
      }
      case Operator.LTE: {
        if (matchItem.criteria?.valueType === ValueType.VERSION_STRING) {
          return this.getPaddedAppVersion(String(origin)) <= this.getPaddedAppVersion(String(criteria));
        }

        return (origin as number) <= (criteria as number);
      }
      case Operator.LT: {
        if (matchItem.criteria?.valueType === ValueType.VERSION_STRING) {
          return this.getPaddedAppVersion(String(origin)) < this.getPaddedAppVersion(String(criteria));
        }

        return (origin as number) < (criteria as number);
      }
      case Operator.PREFIX: {
        return isString(criteria) && isString(origin) && origin.startsWith(criteria);
      }
      case Operator.NOT_PREFIX: {
        return isString(criteria) && !(isString(origin) && origin.startsWith(criteria));
      }
      case Operator.SUFFIX: {
        return isString(criteria) && isString(origin) && origin.endsWith(criteria);
      }
      case Operator.NOT_SUFFIX: {
        return isString(criteria) && !(isString(origin) && origin.endsWith(criteria));
      }
      case Operator.NAN: {
        return isNaN(origin as number);
      }
      case Operator.NUMBER: {
        return !isNaN(origin as number);
      }
      case Operator.KEY_OF: {
        if (!isObject(criteria) || !criteria || !isString(origin)) {
          return false;
        }
        return Object.keys(criteria).includes(origin);
      }
      default:
        return false;
    }
  }

  isRawMatchItem(raw: RawMatchItem | RawMatch): raw is RawMatchItem {
    return !isNil((raw as RawMatchItem).origin) && !isNil((raw as RawMatchItem).operator);
  }
}
