import type { RouteContext } from '../core';
import type { RouteProcessor } from '../processor/RouteProcessor';
import { GroupExecutor } from './GroupExecutor';

export class RouteExecutor {
  protected readonly routeProcessor: RouteProcessor;
  protected readonly ctx: RouteContext;
  protected readonly groupExecutors: GroupExecutor[];

  constructor(routeProcessor: RouteProcessor, options: {
    ctx: RouteContext;
  }) {
    this.ctx = options.ctx;
    this.routeProcessor = routeProcessor;
    this.groupExecutors = this.routeProcessor.groupProcessors.map(groupProcessor => {
      return new GroupExecutor(groupProcessor, {
        ctx: this.ctx,
      });
    });
  }

  /**
   * redirect -> beforeRequest -> fetch -> beforeResponse
   */
  public async execute() {
    // redirect
    await this.redirect();
    // redirect success, skip next
    if (this.ctx.response) {
      return;
    }
    // before request
    await this.beforeRequest();
    if (!this.ctx.response) {
      await this.request();
    }
    // before response
    await this.beforeResponse();
  }

  public async redirect() {
    for (const groupExecutor of this.groupExecutors) {
      const result = await groupExecutor.redirect();
      // break 为 true，跳过后面的 group 执行
      if (result.break) {
        break;
      }
    }
  }

  /**
   * before request 生命周期
   */
  public async beforeRequest() {
    for (const groupExecutor of this.groupExecutors) {
      const result = await groupExecutor.beforeRequest();
      // break 为 true，跳过后面的 group 执行
      // skipRequest 为 true 时，跳过后面的 group 执行
      if (result.break) {
        break;
      }
    }
  }

  public async request() {
    return this.ctx.runMiddleware();
  }

  /**
   * before response 生命周期
   */
  public async beforeResponse() {
    for (const groupExecutor of this.groupExecutors) {
      const result = await groupExecutor.beforeResponse();
      if (result.break) {
        break;
      }
    }
  }
}
