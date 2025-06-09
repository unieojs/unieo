import type { GroupProcessorType, RouteStatus, SubProcessorType } from '../common/Enum';

export type BaseRouteConfigMeta = object;

export type BaseRouteConfigArgs = Record<string, unknown>;

export interface BaseRouteConfig<
  T extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  M extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> {
  readonly name: string;
  readonly type: string;
  readonly meta: T;
  readonly args?: M;
  readonly status?: RouteStatus;
}

export interface SubRouteConfig<
  T extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  M extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> extends BaseRouteConfig<T, M> {
  readonly processor: SubProcessorType;
}

export interface GroupRouteConfig<
  T extends BaseRouteConfigMeta = BaseRouteConfigMeta,
  M extends BaseRouteConfigArgs = BaseRouteConfigArgs,
> extends BaseRouteConfig<T, M> {
  readonly processor: GroupProcessorType;
  readonly routes: SubRouteConfig[];
}

export interface RouteConfig {
  readonly routes: GroupRouteConfig[];
}
