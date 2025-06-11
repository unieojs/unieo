import type { BaseMeta, MetaCreator } from './BaseMeta';
import { RedirectMeta } from './RedirectMeta';
import type { ILogger } from '../../../types';
import type { RouteContext } from '../../RouteContext';

export class MetaManager {
  private static instance: MetaManager;
  private metas = new Map<string, MetaCreator>();

  private constructor() {
    // 注册默认的 Meta 类型
    this.register('redirects', RedirectMeta.create);
    // this.register('requestRewrite', RequestRewriteMeta);
    // this.register('responseRewrite', ResponseRewriteMeta);
  }

  public static getInstance(): MetaManager {
    if (!MetaManager.instance) {
      MetaManager.instance = new MetaManager();
    }
    return MetaManager.instance;
  }

  public register(type: string, metaClass: MetaCreator): void {
    if (this.metas.has(type)) {
      throw new Error(`Meta type ${type} already exists`);
    }
    this.metas.set(type, metaClass);
  }

  public create(options: {
    type: string,
    logger: ILogger;
    data: unknown;
  }): BaseMeta {
    const metaCreator = this.metas.get(options.type);
    if (!metaCreator) {
      throw new Error(`Meta type ${options.type} not found`);
    }
    return metaCreator(options);
  }

  public handleResult(type: string, result: unknown, ctx: RouteContext) {

  }
}
