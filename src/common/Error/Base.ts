export interface BaseErrorOptions extends Error {
  code: number;
  summary?: string;
  details?: string;
  needReport?: boolean;
  [key: string]: unknown;
}

export class BaseError<T extends BaseErrorOptions = BaseErrorOptions> extends Error {
  public code: number;
  public summary?: string;
  public details?: string;
  public needReport: boolean;
  protected options?: T;

  constructor(options?: T) {
    super(options?.message);
    this.options = options ?? ({} as T);
    this.name = this.options.name ?? this.name;
    this.message = this.options.message ?? this.message;
    this.stack = this.options.stack ?? this.stack;
    this.code = this.options.code ?? 0;
    this.summary = this.options.summary ?? '';
    this.details = this.options.details ?? '';
    this.needReport = this.options.needReport ?? false;
  }

  // 用于加上返回头上，方便前端定位问题
  public toShownString(): string {
    return this.summary ? `${this.code}_${this.summary}` : `${this.code}`;
  }

  static isBaseError(err: unknown): err is BaseError {
    return err instanceof BaseError;
  }
}
