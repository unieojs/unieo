import type { RouteContext } from './RouteContext';
import type {
  BaseRouteConfigArgs,
  BaseRouteConfigMeta,
  GroupRouteConfig,
  SubRouteConfig,
} from './RouteConfig';
import type { ILogger, RouteHelper } from '../types';

export interface BaseProcessor<
  M extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  T extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> {
  readonly name: string;
  readonly type: string;
  readonly break: boolean;
  readonly weakDep?: boolean;
  readonly logger: ILogger;
  readonly meta: M;
  readonly args: T;
  readonly needRedirect: boolean;
  readonly needBeforeRequest: boolean;
  readonly needBeforeResponse: boolean;
  // 匹配
  checkMatch(): Promise<boolean>;
}

export interface SubProcessor<
  M extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  T extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> extends BaseProcessor<M, T> {
  readonly breakGroup: boolean;
  // 重定向
  redirect(): Promise<Response | undefined>;
  // 请求前
  beforeRequest(request: Request): Promise<Request>;
  // 响应前
  beforeResponse(response: Response): Promise<Response>;
}

export interface GroupProcessor<
  M extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  T extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> extends BaseProcessor<M, T> {
  // 子处理器
  readonly subProcessors: SubProcessor<M, T>[];
}

export type GroupProcessorCreator = (
  ctx: RouteContext,
  groupRouteConfig: GroupRouteConfig,
  subProcessor: SubProcessor[],
  helper: RouteHelper,
) => GroupProcessor;
export type SubProcessorCreator = (
  ctx: RouteContext,
  subRouteConfig: SubRouteConfig,
  helper: RouteHelper,
) => SubProcessor;
