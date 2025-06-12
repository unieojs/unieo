import { SourceProcessorManager } from './SourceProcessorManager';
import { ValueProcessorManager } from './ValueProcessorManager';
import type { ValueSourceType, ValueType } from '../../common/Enum';
import type { RouteContext } from '../RouteContext';
import type { ISourceProcessor } from './SourceProcessor';
import type { IValueProcessor } from './ValueProcessor';
import type { BaseProcessor } from '../new_processor/processor/BaseProcessor';

export const sourceProcessorManager = new SourceProcessorManager();

export const valueProcessorMap = new ValueProcessorManager();

export interface ValueRawData {
  source: unknown;
  sourceType: ValueSourceType;
  valueType?: ValueType;
}

export interface IValue {
  get(ctx: RouteContext): Promise<unknown>;
  toObject(): { source: unknown; sourceType: ValueSourceType };
  get source(): unknown;
  get sourceType(): ValueSourceType;
  get valueType(): ValueType | undefined;
}

export class Value implements IValue {
  readonly #source: unknown;
  readonly #sourceType: ValueSourceType;
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

  get sourceType(): ValueSourceType {
    return this.#sourceType;
  }

  get valueType(): ValueType | undefined {
    return this.#valueType;
  }

  async get(ctx: RouteContext): Promise<unknown> {
    const value = this.#sourceProcessor ? await this.#sourceProcessor.getSource(this, ctx, this.#processor) : null;
    return this.#valueProcessor?.getValue(value, ctx, this.#processor) ?? value;
  }

  toObject() {
    return {
      source: this.#source,
      sourceType: this.#sourceType,
    };
  }
}
