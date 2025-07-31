import { ValueSourceType, ValueType } from '../../common/Enum';
import type { BaseProcessor } from '../processor';
import type { RouteContext } from '../RouteContext';
import type { ISourceProcessor } from './SourceProcessor';
import { SourceProcessorManager } from './SourceProcessorManager';
import type { IValueProcessor } from './ValueProcessor';
import { ValueProcessorManager } from './ValueProcessorManager';

export type { ISourceProcessor, IValueProcessor };
export { ValueType, ValueSourceType };

export const sourceProcessorManager = new SourceProcessorManager();

export const valueProcessorMap = new ValueProcessorManager();

export interface ValueRawData {
  source: unknown;
  sourceType: string;
  valueType?: ValueType;
}

export interface IValue<T = unknown> {
  get(ctx: RouteContext): Promise<T>;
  toObject(): { source: unknown; sourceType: string };
  get source(): unknown;
  get sourceType(): string;
  get valueType(): ValueType | undefined;
}

export class Value<T = unknown> implements IValue<T> {
  readonly #source: unknown;
  readonly #sourceType: string;
  readonly #valueType?: ValueType;
  readonly #processor: BaseProcessor;
  readonly #sourceProcessor?: ISourceProcessor;
  readonly #valueProcessor?: IValueProcessor;

  constructor(raw: ValueRawData, processor: BaseProcessor) {
    this.#source = raw.source;
    this.#sourceType = raw.sourceType;
    this.#valueType = raw.valueType;
    this.#processor = processor;
    this.#sourceProcessor = sourceProcessorManager.get(this.#sourceType);
    this.#valueProcessor = this.#valueType && valueProcessorMap.get(this.#valueType);
  }

  get source(): unknown {
    return this.#source;
  }

  get sourceType(): string {
    return this.#sourceType;
  }

  get valueType(): ValueType | undefined {
    return this.#valueType;
  }

  async get(ctx: RouteContext): Promise<T> {
    const value = this.#sourceProcessor ? await this.#sourceProcessor.getSource(this, ctx, this.#processor) : null;
    return (this.#valueProcessor?.getValue(value, ctx, this.#processor) ?? value) as T;
  }

  toObject() {
    return {
      source: this.#source,
      sourceType: this.#sourceType,
    };
  }
}
