import type { GroupProcessor } from '../core';
import type { HttpClient, ILogger, RouteHelper } from '../types';

export interface RouteProcessorRawData<T extends GroupProcessor = GroupProcessor> {
  groupProcessors: T[];
  helper: RouteHelper;
}

export class RouteProcessor<T extends GroupProcessor = GroupProcessor> {
  public readonly groupProcessors: T[];
  public readonly logger: ILogger;
  public readonly httpClient: HttpClient;

  constructor(data: RouteProcessorRawData<T>) {
    this.groupProcessors = data.groupProcessors;
    this.logger = data.helper.logger;
    this.httpClient = data.helper.httpClient;
  }
}
