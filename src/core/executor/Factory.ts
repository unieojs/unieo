import type { RouteContext } from '../RouteContext';
import type { GroupProcessor } from '../processor';
import type { BaseExecutor } from './BaseExecutor';
import { type ExecutorConstructor } from './BaseExecutor';
import { RedirectExecutor } from './impl/RedirectExecutor';
import { MetaType } from '../meta';
import { RequestRewriteExecutor } from './impl/RequestRewriteExecutor';
import { ResponseRewriteExecutor } from './impl/ResponseRewriteExecutor';

// Executor 工厂类，负责注册和创建 Executor 实例
export class ExecutorFactory {
  private static readonly executorConstructors = new Map<string, ExecutorConstructor<any>>();
  private static initialized = false;

  // 确保工厂已初始化
  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeBuiltins();
      this.initialized = true;
    }
  }

  // 初始化内置的 Executor 类
  private static initializeBuiltins(): void {
    this.executorConstructors.set(MetaType.REDIRECT, RedirectExecutor);
    this.executorConstructors.set(MetaType.REQUEST_REWRITE, RequestRewriteExecutor);
    this.executorConstructors.set(MetaType.RESPONSE_REWRITE, ResponseRewriteExecutor);
  }

  // 注册 Executor 类 - 支持泛型 Context
  public static register<TContext extends RouteContext = RouteContext>(
    type: string,
    constructor: ExecutorConstructor<TContext>,
  ): void {
    this.ensureInitialized();
    this.executorConstructors.set(type, constructor);
  }

  // 创建 Executor 实例 - 支持泛型 Context
  public static create<TContext extends RouteContext = RouteContext>(
    type: string,
    options: {
      groupProcessor: GroupProcessor;
      ctx: TContext;
    },
  ): BaseExecutor<TContext> {
    this.ensureInitialized();
    const constructor = this.executorConstructors.get(type) as ExecutorConstructor<TContext>;
    if (!constructor) {
      throw new Error(`Executor type '${type}' not found. Available types: ${Array.from(this.executorConstructors.keys()).join(', ')}`);
    }

    return new constructor(options);
  }
}
