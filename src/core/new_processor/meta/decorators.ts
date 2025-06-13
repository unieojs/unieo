import type { ILogger } from '../../../types';
import type { BaseMeta } from './BaseMeta';
import type { BaseProcessor } from '../processor/BaseProcessor';
import type { RouteContext } from '../../RouteContext';

type MetaConstructor = new (options: {
  type: string;
  logger: ILogger;
  ctx: RouteContext;
  data: any;
  processor: BaseProcessor;
}) => BaseMeta;

// 存储所有注册的 Meta 构造函数
const metaConstructors = new Map<string, MetaConstructor>();

// 装饰器工厂函数
export function RouteMeta(type: string) {
  return function (constructor: new (options: {
    type: string;
    logger: ILogger;
    ctx: RouteContext;
    data: any;
    processor: BaseProcessor;
  }) => BaseMeta) {
    // 注册到 map 中
    metaConstructors.set(type, constructor);
  };
}

// 获取所有注册的 Meta 构造函数
export function getMetaConstructors(): Map<string, MetaConstructor> {
  return metaConstructors;
}
