export class HostInfo {
  #platform: string;
  #platformId: string;

  constructor(platform: string, platformId: string) {
    this.#platform = platform;
    this.#platformId = platformId;
  }

  get platform(): string {
    return this.#platform;
  }

  set platform(value: string) {
    this.#platform = value;
  }

  get platformId(): string {
    return this.#platformId;
  }

  set platformId(value: string) {
    this.#platformId = value;
  }

  public clone(): HostInfo {
    return new HostInfo(this.#platform, this.#platformId);
  }
}
