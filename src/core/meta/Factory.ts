import type { ILogger } from '../../types';
import type { BaseMeta } from './BaseMeta';
import type { BaseProcessor } from '../processor';
import type { RouteContext } from '../RouteContext';
import { RedirectMeta } from './impl/RedirectMeta';
import { MetaType } from './enum';
import { RequestRewriteMeta } from './impl/RequestRewriteMeta';
import { ResponseRewriteMeta } from './impl/ResponseRewriteMeta';

export type MetaConstructor<TContext extends RouteContext = RouteContext> = new (options: {
  type: string;
  logger: ILogger;
  ctx: TContext;
  data: any;
  processor: BaseProcessor;
}) => BaseMeta<TContext>;

// Meta 工厂类，负责注册和创建 Meta 实例
export class MetaFactory {
  private static readonly metaConstructors = new Map<string, MetaConstructor<any>>();
  private static initialized = false;

  // 确保工厂已初始化
  private static ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeBuiltins();
      this.initialized = true;
    }
  }

  // 初始化内置的 Meta 类
  private static initializeBuiltins(): void {
    this.metaConstructors.set(MetaType.REDIRECT, RedirectMeta);
    this.metaConstructors.set(MetaType.REQUEST_REWRITE, RequestRewriteMeta);
    this.metaConstructors.set(MetaType.RESPONSE_REWRITE, ResponseRewriteMeta);
  }

  // 注册 Meta 类 - 支持泛型 Context
  public static register<TContext extends RouteContext = RouteContext>(
    type: string,
    constructor: MetaConstructor<TContext>,
  ): void {
    this.ensureInitialized();
    this.metaConstructors.set(type, constructor);
  }

  // 创建 Meta 实例 - 支持泛型 Context
  public static create<TContext extends RouteContext = RouteContext>(
    type: string,
    options: {
      logger: ILogger;
      ctx: TContext;
      data: any;
      processor: BaseProcessor;
    },
  ): BaseMeta<TContext> {
    this.ensureInitialized();
    const constructor = this.metaConstructors.get(type) as MetaConstructor<TContext>;
    if (!constructor) {
      throw new Error(`Meta type '${type}' not found. Available types: ${Array.from(this.metaConstructors.keys()).join(', ')}`);
    }

    return new constructor({
      type,
      ...options,
    });
  }

  // 检查是否已注册某个类型
  public static isRegistered(type: string): boolean {
    this.ensureInitialized();
    return this.metaConstructors.has(type);
  }
}
