import type { ILogger } from '../types';

export class PrefixLogger implements ILogger {
  private readonly prefix: string;
  private readonly logger: ILogger;

  constructor(prefix: string, logger: ILogger) {
    this.prefix = prefix;
    this.logger = logger;
  }

  public log(...args: unknown[]): void {
    this.write(this.logger.log, args);
  }

  public info(...args: unknown[]): void {
    this.write(this.logger.info, args);
  }

  public error(...args: unknown[]): void {
    this.write(this.logger.error, args);
  }

  public warn(...args: unknown[]): void {
    this.write(this.logger.warn, args);
  }

  public debug(...args: unknown[]): void {
    this.write(this.logger.debug, args);
  }

  private write(method: (...args: unknown[]) => void, args: unknown[]): void {
    if (typeof args[0] === 'string') {
      args[0] = `${this.prefix} ${args[0]}`;
    } else if (args[0] instanceof Error) {
      args[0].message = `${this.prefix} ${args[0].message}`;
    } else {
      args.unshift(this.prefix);
    }
    Reflect.apply(method, this.logger, args);
  }
}
