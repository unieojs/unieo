import {
  type GroupRouteConfig,
  type RawRedirect,
  type RawRequestRewrite,
  type RawResponseRewrite,
  RouteContext,
  type SubProcessor,
  type SubRouteConfig,
} from '../src/core';
import { type ERFetchEvent, type RouteHelper } from '../src/types';
import { ERPerformance } from '../src/core/ERPerformance';
import { ERHttpClient } from '../src/core/Fetch';
import { CommonGroupProcessor, CommonSubProcessor } from '../src/processor';
import { RouteProcessor, type RouteProcessorRawData } from '../src/processor/RouteProcessor';
import {
  GroupProcessorType,
  RedirectType,
  RequestRewriteType,
  ResponseRewriteOperation,
  ResponseRewriteType,
  RewriteOperation,
  RouteStatus,
  SubProcessorType,
  ValueSourceType,
} from '../src/common/Enum';

export const fetchMock = getMiniflareFetchMock();
fetchMock.disableNetConnect();

export class TestUtil {
  static mockHelper(arg?: Partial<RouteHelper>): RouteHelper {
    return {
      logger: arg?.logger ?? console,
      httpClient: arg?.httpClient ?? new ERHttpClient(),
    };
  }

  static mockFetchEvent(arg?: {
    url?: string;
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
  }): ERFetchEvent {
    const { url = 'https://mock.com', headers = {}, method = 'GET', body } = arg ?? {};
    const request = TestUtil.mockRequest(url, headers, method, body);
    return new FetchEvent('fetch', {
      request,
    }) as ERFetchEvent;
  }

  static mockRequest(urlStr: string, headers?: HeadersInit, method?: string, body?: BodyInit | null): Request {
    const url = new URL(urlStr);
    return new Request(url, {
      headers,
      method,
      body,
    });
  }

  static mockRouteContext(arg?: {
    url?: string;
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    helper?: Partial<RouteHelper>;
  }): RouteContext {
    const event = TestUtil.mockFetchEvent(arg);
    return new RouteContext({
      performance: new ERPerformance(),
      request: event.request,
      event,
      helper: TestUtil.mockHelper(arg?.helper),
    });
  }

  static mockRedirect(): RawRedirect[] {
    return [
      {
        permanent: true,
        source: '/foo',
        destination: '/bar',
        type: RedirectType.PATH,
      },
    ];
  }

  static mockRequestRewrite(): RawRequestRewrite[] {
    return [
      {
        type: RequestRewriteType.HEADER,
        field: 'foo',
        value: { source: 'bar', sourceType: ValueSourceType.LITERAL },
        operation: RewriteOperation.SET,
      },
    ];
  }

  static mockResponseRewrite(): RawResponseRewrite[] {
    return [
      {
        type: ResponseRewriteType.HEADER,
        field: 'foo',
        value: { source: 'bar', sourceType: ValueSourceType.LITERAL },
        operation: ResponseRewriteOperation.SET,
      },
    ];
  }

  static mockCommonSubProcessor(ctx?: RouteContext, subRouteConfig?: Partial<SubRouteConfig>): CommonSubProcessor {
    ctx = ctx ?? TestUtil.mockRouteContext();
    return CommonSubProcessor.create(ctx, TestUtil.mockSubRouteConfig(subRouteConfig), TestUtil.mockHelper());
  }

  static mockCommonGroupProcessor(
    ctx?: RouteContext,
    groupRouteConfig?: Partial<GroupRouteConfig>,
    subProcessors?: SubProcessor[],
  ): CommonGroupProcessor {
    ctx = ctx ?? TestUtil.mockRouteContext();
    subProcessors = subProcessors ?? [ TestUtil.mockCommonSubProcessor(ctx) ];
    return CommonGroupProcessor.create(
      ctx,
      TestUtil.mockGroupRouteConfig(groupRouteConfig),
      subProcessors,
      TestUtil.mockHelper(),
    );
  }

  static mockRouteProcessor(data?: Partial<RouteProcessorRawData>): RouteProcessor {
    return new RouteProcessor({
      groupProcessors: [ TestUtil.mockCommonGroupProcessor() ],
      helper: TestUtil.mockHelper(),
      ...data,
    });
  }

  static mockSubRouteConfig(info?: Partial<SubRouteConfig>): SubRouteConfig {
    return {
      name: 'mock_name',
      type: 'mock_type',
      status: RouteStatus.ONLINE,
      processor: SubProcessorType.COMMON_SUB_PROCESSOR,
      ...info,
      meta: {
        ...info?.meta,
      },
      args: {
        ...info?.args,
      },
    };
  }

  static mockGroupRouteConfig(info?: Partial<GroupRouteConfig>): GroupRouteConfig {
    return {
      name: 'mock_name',
      type: 'mock_type',
      status: RouteStatus.ONLINE,
      processor: GroupProcessorType.COMMON_GROUP_PROCESSOR,
      routes: [],
      ...info,
      meta: {
        ...info?.meta,
      },
      args: {
        ...info?.args,
      },
    };
  }

  // static mockRequest(
  //   urlStr: string,
  //   headers?: HeadersInit,
  //   method?: string,
  //   body?: BodyInit | null,
  // ): Request {
  //   const url = new URL(urlStr);
  //   return new Request(url, {
  //     headers,
  //     method,
  //     body,
  //   });
  // }

  static mockResponse(result?: string, headers?: HeadersInit) {
    return new Response(result ?? 'ok', {
      headers,
    });
  }
}
