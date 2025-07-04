import {
  BooleanValueProcessor,
  IntegerValueProcessor,
  JsonValueProcessor,
  MatchValueProcessor,
  NumberValueProcessor,
  StringValueProcessor,
} from './ValueProcessor';
import { ValueType } from '../../common/Enum';
import type { IValueProcessor } from './ValueProcessor';

const stringValueProcessor = new StringValueProcessor();

export class ValueProcessorManager {
  static valueProcessorMap = new Map<ValueType, IValueProcessor>([
    [ ValueType.JSON, new JsonValueProcessor() ],
    [ ValueType.STRING, stringValueProcessor ],
    [ ValueType.VERSION_STRING, stringValueProcessor ],
    [ ValueType.NUMBER, new NumberValueProcessor() ],
    [ ValueType.INTEGER, new IntegerValueProcessor() ],
    [ ValueType.BOOLEAN, new BooleanValueProcessor() ],
    [ ValueType.MATCH, new MatchValueProcessor() ],
  ]);

  register(valueType: ValueType, processor: IValueProcessor) {
    if (ValueProcessorManager.valueProcessorMap.has(valueType)) {
      return;
    }
    ValueProcessorManager.valueProcessorMap.set(valueType, processor);
  }

  get(valueType: ValueType): IValueProcessor | undefined {
    return ValueProcessorManager.valueProcessorMap.get(valueType);
  }
}
