import { GroupProcessor, RouteContext, RouteProcessor, SubProcessor } from '../src';
import type { ERFetchEvent, RouteHelper } from '../src/types';
import { ERPerformance } from '../src/core/ERPerformance';
import { ERHttpClient } from '../src/core/Fetch';
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
import type { GroupRawRoute, SubRawRoute, RouteProcessorData , RawRedirect, RawRequestRewrite, RawResponseRewrite } from '../src';
import { PrefixLogger } from '../src/util/PrefixLogger';

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

  static mockCommonSubProcessor(ctx?: RouteContext, subRouteConfig?: Partial<SubRawRoute>): SubProcessor {
    ctx = ctx ?? TestUtil.mockRouteContext();
    const subRawRoute = TestUtil.mockSubRouteConfig(subRouteConfig);
    return SubProcessor.create(ctx, subRawRoute, TestUtil.mockHelper({
      logger: new PrefixLogger(`[sub/${subRawRoute.name}]`, console),
    }));
  }

  static mockCommonGroupProcessor(
    ctx?: RouteContext,
    groupRouteConfig?: Partial<GroupRawRoute>,
    subProcessors?: SubProcessor[],
  ): GroupProcessor {
    ctx = ctx ?? TestUtil.mockRouteContext();
    subProcessors = subProcessors ?? [ TestUtil.mockCommonSubProcessor(ctx) ];
    const groupRawRoute = TestUtil.mockGroupRouteConfig(groupRouteConfig);
    return GroupProcessor.create(
      ctx,
      groupRawRoute,
      subProcessors,
      TestUtil.mockHelper({
        logger: new PrefixLogger(`[group/${groupRawRoute.name}]`, console),
      }),
    );
  }

  static mockRouteProcessor(data?: Partial<RouteProcessorData>): RouteProcessor {
    return new RouteProcessor({
      groupProcessors: [ TestUtil.mockCommonGroupProcessor() ],
      ...data,
    });
  }

  static mockSubRouteConfig(info?: Partial<SubRawRoute>): SubRawRoute {
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

  static mockGroupRouteConfig(info?: Partial<GroupRawRoute>): GroupRawRoute {
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
