import type { RouteContext } from '../RouteContext';
import type { GroupProcessor } from '../processor/GroupProcessor';
import type { ILogger } from '../../types';

export interface SubExecuteResult<T> {
  success: boolean;
  break: boolean;
  breakGroup: boolean;
  result?: T;
}

export interface ExecuteResult {
  success: boolean;
  break: boolean;
  breakGroup?: boolean;
  result?: unknown;
}

// Executor 构造函数类型
export type ExecutorConstructor = new (options: {
  groupProcessor: GroupProcessor;
  ctx: RouteContext;
}) => BaseExecutor;

// 基础执行器类
export abstract class BaseExecutor {
  protected readonly groupProcessor: GroupProcessor;
  protected readonly ctx: RouteContext;
  protected readonly logger: ILogger;
  protected readonly type: string;

  protected constructor(options: {
    type: string;
    groupProcessor: GroupProcessor;
    ctx: RouteContext;
  }) {
    this.groupProcessor = options.groupProcessor;
    this.ctx = options.ctx;
    this.logger = options.groupProcessor.logger;
    this.type = options.type;
  }

  abstract execute(): Promise<ExecuteResult>;
}
