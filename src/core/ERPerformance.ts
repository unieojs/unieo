export enum PERFORMANCE_STAGE {
  // ER 执行耗时（约等于 TTFB）
  ER_EXECUTION = 'e1',
  // SSR 静态部分（千人一面）连接耗时
  ER_SSR_PRELUDE_CONNECTION = 'e2',
  // SSR 动态部分（千人千面）连接耗时
  ER_SSR_POSTPONED_CONNECTION = 'e3',
}

export const serverTimingHeader = 'server-timing';

type Measure = (during?: number) => void;

export class ERPerformance {
  private readonly stages = new Map<PERFORMANCE_STAGE, { startTime?: number; during?: number; }>();

  private serialize(): string {
    return Array.from(this.stages.entries()).map(([ stage, { during } ]) => {
      return `${stage};dur=${during}`;
    }).join(', ');
  }

  public mark(stage: PERFORMANCE_STAGE): Measure {
    const startTime = Date.now();
    this.stages.set(stage, { startTime });

    return (during = Date.now() - startTime) => {
      this.stages.set(stage, {
        startTime,
        during,
      });
    };
  }

  public async autoMeasure<T>(stage: PERFORMANCE_STAGE, fn: () => Promise<T>): Promise<T> {
    const measure = this.mark(stage);
    const result = await fn();
    measure();
    return result;
  }

  public load(serverTiming: string): void {
    const stages = parseServerTiming(serverTiming);
    stages.forEach(({ during }, stage) => {
      this.stages.set(stage, { during });
    });
  }

  public dumpStage(stage: PERFORMANCE_STAGE): { during?: number, startTime?: number } {
    return this.stages.get(stage) ?? {};
  }

  // public dump(): Array<{ stage: PERFORMANCE_STAGE, during?: number, startTime?: number }> {
  //   return Array.from(this.stages.entries()).map(([ stage, { during, startTime }]) => {
  //     return { stage, startTime, during };
  //   });
  // }

  /**
   * 将性能数据写到 server-timing 响应头中
   */
  public append2Response(response: Response): Response {
    const timing = this.serialize();

    const newResponse = new Response(response.body, response);
    newResponse.headers.set(serverTimingHeader, timing);
    return newResponse;
  }
}

/**
 * 将 Server-Timing: e1;dur=50, e2;dur=50 标准响应头解析为 Map<PERFORMANCE_STAGE, {during: number}>
 */
export function parseServerTiming(timing: string): Map<PERFORMANCE_STAGE, { during: number }> {
  return timing.split(',').reduce((result, item) => {
    const [ key, value ] = item.split(';');
    const stage = key.trim() as PERFORMANCE_STAGE;
    const during = parseInt(value.split('=')[1], 10);
    result.set(stage, { during });
    return result;
  }, new Map<PERFORMANCE_STAGE, { during: number }>());
}
