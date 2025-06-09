import { ValueSourceType } from '../../common/Enum';
import {
  CookieSourceProcessor,
  FetchSourceProcessor,
  LiteralSourceProcessor,
  MethodSourceProcessor,
  OriginUrlSourceProcessor,
  QuerySourceProcessor,
  RequestHeaderSourceProcessor,
  ResponseHeaderSourceProcessor,
  ResponseStatusSourceProcessor,
  RouteArgsSourceProcessor,
  TemplateSourceProcessor,
  UrlSourceProcessor,
  ValueObjectSourceProcessor,
} from './SourceProcessor';
import type { ISourceProcessor } from './SourceProcessor';

export class SourceProcessorManager {
  static sourceProcessorMap = new Map<string, ISourceProcessor>([
    [ ValueSourceType.LITERAL, new LiteralSourceProcessor() ],
    [ ValueSourceType.REQUEST_HEADER, new RequestHeaderSourceProcessor() ],
    [ ValueSourceType.RESPONSE_HEADER, new ResponseHeaderSourceProcessor() ],
    [ ValueSourceType.RESPONSE_STATUS, new ResponseStatusSourceProcessor() ],
    [ ValueSourceType.COOKIE, new CookieSourceProcessor() ],
    [ ValueSourceType.URL, new UrlSourceProcessor() ],
    [ ValueSourceType.ORIGIN_URL, new OriginUrlSourceProcessor() ],
    [ ValueSourceType.QUERY, new QuerySourceProcessor() ],
    [ ValueSourceType.METHOD, new MethodSourceProcessor() ],
    [ ValueSourceType.FETCH, new FetchSourceProcessor() ],
    [ ValueSourceType.ROUTE_ARGS, new RouteArgsSourceProcessor() ],
    [ ValueSourceType.STRING_TEMPLATE, new TemplateSourceProcessor() ],
    [ ValueSourceType.VALUE_OBJECT, new ValueObjectSourceProcessor() ],
  ]);

  register(sourceType: string, processor: ISourceProcessor) {
    if (SourceProcessorManager.sourceProcessorMap.has(sourceType)) {
      throw new Error(`Source processor ${sourceType} already exists`);
    }
    SourceProcessorManager.sourceProcessorMap.set(sourceType, processor);
  }

  get(sourceType: string): ISourceProcessor | undefined {
    return SourceProcessorManager.sourceProcessorMap.get(sourceType);
  }
}
