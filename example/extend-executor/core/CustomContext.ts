import { RouteContext, RouteContextRawData } from '../../../src';
import { HostInfo } from './HostInfo';

export class CustomContext extends RouteContext {
  #hostInfo?: HostInfo;

  set hostInfo(value: HostInfo) {
    this.#hostInfo = value;
  }

  get hostInfo(): HostInfo | undefined {
    return this.#hostInfo;
  }
}
