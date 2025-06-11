import type { RouteContext } from '../../RouteContext';
import type { GroupProcessor } from '../processor/GroupProcessor';
import type { SubProcessor } from '../processor/SubProcessor';

export interface ExecuteResult {
  success: boolean;
  break: boolean;
  breakGroup?: boolean;
  result?: any;
}

// 存储所有注册的执行器构造函数
const groupExecutors = new Map<string, GroupExecutorConstructor>();
const subExecutors = new Map<string, SubExecutorConstructor>();

// 装饰器工厂函数
export function GroupExecutor(type: string) {
  return function (target: GroupExecutorConstructor) {
    groupExecutors.set(type, target);
  };
}

export function SubExecutor(type: string) {
  return function (target: SubExecutorConstructor) {
    subExecutors.set(type, target);
  };
}

// 获取所有注册的执行器构造函数
export function getGroupExecutors(): Map<string, GroupExecutorConstructor> {
  return groupExecutors;
}

export function getSubExecutors(): Map<string, SubExecutorConstructor> {
  return subExecutors;
}

// 基础执行器接口
export abstract class BaseExecutor {
  abstract execute(ctx: RouteContext): Promise<ExecuteResult>;
}

// Group 执行器接口
export type GroupExecutorConstructor = new (options: { groupProcessor: GroupProcessor }) => BaseGroupExecutor;

export abstract class BaseGroupExecutor extends BaseExecutor {
  protected readonly groupProcessor: GroupProcessor;
  protected readonly subExecutors: Map<string, BaseSubExecutor>;

  protected constructor(options: {
    groupProcessor: GroupProcessor;
  }) {
    super();
    this.groupProcessor = options.groupProcessor;
    this.subExecutors = this.createSubExecutors();
  }

  protected createSubExecutors(): Map<string, BaseSubExecutor> {
    const executors = new Map<string, BaseSubExecutor>();
    const subExecutorConstructors = getSubExecutors();

    for (const [ type, constructor ] of subExecutorConstructors) {
      executors.set(type, new constructor({
        subProcessor: this.groupProcessor.subProcessors[0], // 这里需要根据实际情况选择 subProcessor
      }));
    }

    return executors;
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
