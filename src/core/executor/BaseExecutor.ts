import type { RouteContext } from '../RouteContext';
import type { GroupProcessor } from '../processor/GroupProcessor';
import type { ILogger } from '../../types';

export interface SubExecuteResult<T> {
  success: boolean;
  break: boolean;
  breakGroup: boolean;
  result?: T;
}

export interface ExecuteResult<T = unknown> {
  success: boolean;
  break: boolean;
  breakGroup?: boolean;
  result?: T;
}

// Executor 构造函数类型 - 支持泛型 Context
export type ExecutorConstructor<TContext extends RouteContext = RouteContext> = new (options: {
  groupProcessor: GroupProcessor;
  ctx: TContext;
}) => BaseExecutor<TContext>;

// 基础执行器类
export abstract class BaseExecutor<T extends RouteContext = RouteContext> {
  protected readonly groupProcessor: GroupProcessor;
  protected readonly ctx: T;
  protected readonly logger: ILogger;
  protected readonly type: string;

  protected constructor(options: {
    type: string;
    groupProcessor: GroupProcessor;
    ctx: T;
  }) {
    this.groupProcessor = options.groupProcessor;
    this.ctx = options.ctx;
    this.logger = options.groupProcessor.logger;
    this.type = options.type;
  }

  abstract execute(): Promise<any>;
}
