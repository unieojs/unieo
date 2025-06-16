// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { SubProcessorType } from '../../common/Enum';
import {
  Match,
  Redirect,
  RequestRewrite,
  ResponseRewrite,
} from '../../core';
import type {
  BaseRouteConfigArgs,
  BaseRouteConfigMeta,
  RawMatch,
  RawRedirect,
  RawRequestRewrite,
  RawResponseRewrite,
  RouteContext,
  SubProcessor,
  SubRouteConfig,
} from '../../core';
import type { ILogger, RouteHelper } from '../../types';

export interface RawCommonSubProcessor<
  M extends CommonSubProcessorRouteConfigMeta = CommonSubProcessorRouteConfigMeta,
  A extends CommonSubProcessorRouteConfigArgs = CommonSubProcessorRouteConfigArgs,
> {
  ctx: RouteContext;
  routeConfig: SubRouteConfig<M, A>;
  logger: ILogger;
}

export interface CommonSubProcessorRouteConfigMeta extends BaseRouteConfigMeta {
  weakDep?: boolean;
  match?: RawMatch;
  isBreak?: boolean;
  isBreakGroup?: boolean;
  requestRewrites?: RawRequestRewrite[];
  responseRewrites?: RawResponseRewrite[];
  redirects?: RawRedirect[];
}

type CommonSubProcessorRouteConfigArgs = BaseRouteConfigArgs;

export class CommonSubProcessor<
  M extends CommonSubProcessorRouteConfigMeta = CommonSubProcessorRouteConfigMeta,
  A extends CommonSubProcessorRouteConfigArgs = CommonSubProcessorRouteConfigArgs,
>
implements SubProcessor<M, A> {
  public static readonly processorType = SubProcessorType.COMMON_SUB_PROCESSOR;
  public readonly ctx: RouteContext;
  public readonly name: string;
  public readonly type: string;
  public readonly break: boolean;
  public readonly breakGroup: boolean;
  public readonly weakDep?: boolean;
  public readonly match?: Match;
  public readonly requestRewrites: RequestRewrite[];
  public readonly responseRewrites: ResponseRewrite[];
  public readonly redirects: Redirect[];
  public readonly logger: ILogger;
  public readonly meta: M;
  public readonly args: A;
  public readonly needRedirect: boolean;
  public readonly needBeforeRequest: boolean;
  public readonly needBeforeResponse: boolean;

  protected constructor(rawData: RawCommonSubProcessor<M, A>) {
    const { ctx, logger, routeConfig } = rawData;
    this.ctx = ctx;
    this.logger = logger;
    this.name = routeConfig.name;
    this.type = routeConfig.type;
    this.weakDep = !!routeConfig.meta?.weakDep;
    this.break = !!routeConfig.meta?.isBreak;
    this.breakGroup = !!routeConfig.meta?.isBreakGroup;
    if (routeConfig.meta?.match) {
      this.match = new Match(routeConfig.meta.match, this);
    }
    this.requestRewrites = (routeConfig.meta?.requestRewrites ?? []).map(
      item => new RequestRewrite(item, this),
    );
    this.responseRewrites = (routeConfig.meta?.responseRewrites ?? []).map(
      item => new ResponseRewrite(item, this),
    );
    this.redirects = (routeConfig.meta?.redirects ?? []).map(item => new Redirect(item, this));
    this.meta = routeConfig.meta;
    this.args = routeConfig.args ?? {} as A;
    this.needRedirect = this.redirects.length > 0;
    this.needBeforeRequest = this.requestRewrites.length > 0;
    this.needBeforeResponse = this.responseRewrites.length > 0;
  }

  public static create(ctx: RouteContext, subRouteConfig: SubRouteConfig, helper: RouteHelper): CommonSubProcessor {
    return new CommonSubProcessor({
      ctx,
      routeConfig: subRouteConfig,
      logger: helper.logger,
    });
  }

  public async redirect(): Promise<Response | undefined> {
    // 1. redirect
    for (const redirect of this.redirects) {
      const res = await redirect.redirect(this.ctx);
      if (res) {
        // 重定向生效，跳过后续
        return res;
      }
    }
  }

  public async beforeRequest(request: Request) {
    // 1. requestRewrite
    for (const requestRewrite of this.requestRewrites) {
      request = await requestRewrite.rewrite(request, this.ctx);
    }
    return request;
  }

  public async beforeResponse(response: Response) {
    // 1. responseRewrite
    for (const responseRewrite of this.responseRewrites) {
      response = await responseRewrite.rewrite(response, this.ctx);
    }
    return response;
  }

  async checkMatch(): Promise<boolean> {
    if (!this.match) {
      return true;
    }
    return this.match.match(this.ctx, this.logger);
  }
}
