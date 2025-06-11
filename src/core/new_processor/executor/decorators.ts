import type { RouteContext } from '../../RouteContext';
import type { GroupProcessor } from '../processor/GroupProcessor';
import type { SubProcessor } from '../processor/SubProcessor';

export interface ExecuteResult {
  success: boolean;
  break: boolean;
  breakGroup?: boolean;
  result?: unknown;
}

// 存储所有注册的执行器构造函数
const groupExecutors = new Map<string, GroupExecutorConstructor>();

// 装饰器工厂函数
export function RouteMetaExecutor(type: string) {
  return function (target: GroupExecutorConstructor) {
    groupExecutors.set(type, target);
  };
}

// 获取所有注册的执行器构造函数
export function getRouteMetaExecutors(): Map<string, GroupExecutorConstructor> {
  return groupExecutors;
}

// 基础执行器接口
export abstract class BaseExecutor {
  abstract execute(ctx: RouteContext): Promise<ExecuteResult>;
}

// Group 执行器接口
export type GroupExecutorConstructor = new (options: { groupProcessor: GroupProcessor }) => BaseGroupExecutor;

export abstract class BaseGroupExecutor extends BaseExecutor {
  protected readonly groupProcessor: GroupProcessor;

  protected constructor(options: {
    groupProcessor: GroupProcessor;
  }) {
    super();
    this.groupProcessor = options.groupProcessor;
  }
}

// Sub 执行器接口
export type SubExecutorConstructor = new (options: { subProcessor: SubProcessor }) => BaseSubExecutor;

export abstract class BaseSubExecutor extends BaseExecutor {
  protected readonly subProcessor: SubProcessor;

  protected constructor(options: {
    subProcessor: SubProcessor;
  }) {
    super();
    this.subProcessor = options.subProcessor;
  }
}
