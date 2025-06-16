import type { RouteContext } from '../../RouteContext';
import type { GroupProcessor } from '../processor';
import type { BaseExecutor } from './BaseExecutor';
import { type ExecutorConstructor } from './BaseExecutor';
import { RedirectExecutor } from './RedirectExecutor';
import { MetaType } from '../enum';
import { RequestRewriteExecutor } from './RequestRewriteExecutor';
import { ResponseRewriteExecutor } from './ResponseRewriteExecutor';

// Executor 工厂类，负责注册和创建 Executor 实例
export class ExecutorFactory {
  private static readonly executorConstructors = new Map<string, ExecutorConstructor>();
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

  // 注册 Executor 类
  public static register(type: string, constructor: ExecutorConstructor): void {
    this.ensureInitialized();
    if (this.executorConstructors.has(type)) {
      console.warn(`Executor type '${type}' is already registered. Overwriting existing registration.`);
    }
    this.executorConstructors.set(type, constructor);
    console.log(`Registered Executor class: ${constructor.name} for type '${type}'`);
  }

  // 创建 Executor 实例
  public static create(
    type: string,
    options: {
      groupProcessor: GroupProcessor;
      ctx: RouteContext;
    },
  ): BaseExecutor {
    this.ensureInitialized();
    const constructor = this.executorConstructors.get(type);
    if (!constructor) {
      throw new Error(`Executor type '${type}' not found. Available types: ${Array.from(this.executorConstructors.keys()).join(', ')}`);
    }

    return new constructor(options);
  }

  // 获取所有注册的 Executor 类型
  public static getRegisteredTypes(): string[] {
    this.ensureInitialized();
    return Array.from(this.executorConstructors.keys());
  }

  // 检查是否已注册某个类型
  public static isRegistered(type: string): boolean {
    this.ensureInitialized();
    return this.executorConstructors.has(type);
  }
}
