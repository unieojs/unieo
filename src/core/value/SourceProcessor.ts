import { Value } from '.';
import { isObject, isString } from 'lodash-es';
import type { RouteContext } from '../RouteContext';
import type { UrlValueType } from '../../common/Enum';
import type { IValue, ValueRawData } from '.';
// import { parseUA } from '../../../util/UserAgent';
import { esTemplate } from '../../util/Template';
import type { BaseProcessor } from '../processor/BaseProcessor';

export interface ISourceProcessor {
  getSource(value: IValue, ctx: RouteContext, processor: BaseProcessor): Promise<unknown>;
}

export class LiteralSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue) {
    return source;
  }
}

export class RequestHeaderSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getRequestHeaderValue(source) : null;
  }
}

export class ResponseHeaderSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getResponseHeaderValue(source) : null;
  }
}

export class ResponseStatusSourceProcessor implements ISourceProcessor {
  async getSource(_: IValue, ctx: RouteContext): Promise<unknown> {
    return ctx.response?.status;
  }
}

export class CookieSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getCookieValue(source) : null;
  }
}

export class UrlSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getUrlValue(source as UrlValueType) : null;
  }
}

export class OriginUrlSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getOriginUrlValue(source as UrlValueType) : null;
  }
}

export class QuerySourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext): Promise<unknown> {
    return isString(source) ? ctx.getQueryValue(source) : null;
  }
}

export class MethodSourceProcessor implements ISourceProcessor {
  async getSource(_: unknown, ctx: RouteContext): Promise<unknown> {
    return ctx.request.method;
  }
}

export class FetchSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue): Promise<unknown> {
    return this.fetch(source as string);
  }

  private async fetch(url: string): Promise<unknown> {
    return fetch(url, {
      method: 'GET',
    }).then(res => res.json() as Promise<unknown>);
  }
}

export class RouteArgsSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext, processor: BaseProcessor): Promise<unknown> {
    const arg = processor.args?.[source as string];
    return arg ? new Value(arg as ValueRawData, processor).get(ctx) : null;
  }
}

// export class UserAgentSourceProcessor implements ISourceProcessor {
//   async getSource({ sourceType, source }: IValue, ctx: RouteContext): Promise<unknown> {
//     const ua = ctx.getRequestHeaderValue('user-agent');
//     if (!ua || !source || !isString(source)) {
//       return null;
//     }
//
//     const uaDetail = parseUA(ua);
//     return get(uaDetail, `${sourceType}.${source}`, null);
//   }
// }

export class TemplateSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext, processor: BaseProcessor): Promise<unknown> {
    if (!source || !isString(source)) {
      return null;
    }
    const args: Record<string, unknown> = {};
    for (const key in processor.args) {
      args[key] = await new Value(processor.args[key] as ValueRawData, processor).get(ctx);
    }
    const data = {
      ctx,
      args,
    };
    return esTemplate(source, data);
  }
}

export class ValueObjectSourceProcessor implements ISourceProcessor {
  async getSource({ source }: IValue, ctx: RouteContext, processor: BaseProcessor): Promise<unknown> {
    if (isObject(source)) {
      const valueObj: Record<string, unknown> = {};
      await Promise.all(Object.keys(source).map(async key => {
        valueObj[key] = await new Value((source as Record<string, ValueRawData>)[key], processor).get(ctx);
      }));
      return valueObj;
    }
    return null;
  }
}
