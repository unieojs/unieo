import type { GroupProcessor } from './GroupProcessor';

export interface RouteProcessorData {
  groupProcessors: GroupProcessor[];
}

export class RouteProcessor {
  public readonly groupProcessors: GroupProcessor[];

  constructor(options: RouteProcessorData) {
    this.groupProcessors = options.groupProcessors;
  }
}
