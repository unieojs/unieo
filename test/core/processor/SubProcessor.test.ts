import { assert, describe, it } from 'vitest';
import { TestUtil } from '../../TestUtil';
import {
  Operator,
  RequestRewriteType,
  ResponseRewriteType,
  RewriteOperation,
  UrlValueType,
  ValueSourceType,
} from '../../../src/common/Enum';

describe('test/core/processor/SubProcessor.test.ts', () => {
  it('should request write work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
    });
    const commonProcessor = TestUtil.mockCommonSubProcessor(ctx, {
      meta: {
        requestRewrites: [
          {
            type: RequestRewriteType.URL,
            field: UrlValueType.HOST,
            value: {
              source: 'www.exampleplus.com',
              sourceType: ValueSourceType.LITERAL,
            },
            operation: RewriteOperation.SET,
          },
          {
            type: RequestRewriteType.HEADER,
            field: 'x-foo',
            value: {
              source: 'bar',
              sourceType: ValueSourceType.LITERAL,
            },
            operation: RewriteOperation.SET,
          },
        ],
      },
    });
    const request = await commonProcessor.process('requestRewrites', ctx.request) as Request;
    assert.strictEqual(request.url, 'https://www.exampleplus.com/');
    assert.strictEqual(request.headers.get('x-foo'), 'bar');
  });

  it('should redirect work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/b/index.html',
    });
    const commonProcessor = TestUtil.mockCommonSubProcessor(ctx, {
      meta: {
        redirects: [
          {
            source: '/a/b/(.*)',
            destination: 'https://www.example.com/new_a/(.*)',
            type: 'path_regexp',
          },
          {
            source: '/a/b/:id',
            destination: 'https://www.example.com/new_a/new_b/:id',
            type: 'path_regexp',
          },
        ],
        requestRewrites: [
          {
            type: RequestRewriteType.URL,
            field: UrlValueType.HOST,
            value: {
              source: 'www.exampleplus.com',
              sourceType: ValueSourceType.LITERAL,
            },
            operation: RewriteOperation.SET,
          },
        ],
      },
    });
    const response = await commonProcessor.process('redirects') as Response;
    assert(response);
    assert.strictEqual(response.status, 302);
    assert.strictEqual(response.headers.get('location'), 'https://www.example.com/new_a/index.html');
  });

  it('should response write work', async () => {
    const ctx = TestUtil.mockRouteContext();
    ctx.setResponse(
      TestUtil.mockResponse('ok', {
        'x-foo': 'bar',
      }),
    );
    const commonProcessor = TestUtil.mockCommonSubProcessor(ctx, {
      meta: {
        responseRewrites: [
          {
            type: ResponseRewriteType.HEADER,
            field: 'x-foo',
            value: {
              source: 'baz',
              sourceType: ValueSourceType.LITERAL,
            },
            operation: RewriteOperation.SET,
          },
          {
            type: ResponseRewriteType.HEADER,
            field: 'x-foo',
            value: {
              source: '1',
              sourceType: ValueSourceType.LITERAL,
            },
            operation: RewriteOperation.APPEND,
          },
        ],
      },
    });
    await commonProcessor.process('responseRewrites', ctx.response);
    assert.strictEqual(ctx.response!.headers.get('x-foo'), 'baz, 1');
  });

  it('should checkMatch work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/b/index.html',
      headers: {
        'x-foo': 'bar',
      },
    });
    const commonProcessor = TestUtil.mockCommonSubProcessor(ctx, {
      meta: {
        match: {
          list: [
            {
              origin: {
                source: UrlValueType.PATH,
                sourceType: ValueSourceType.URL,
              },
              criteria: {
                source: '/a/b/(.*)',
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.PATH_REGEXP,
            },
            {
              origin: {
                source: 'x-foo',
                sourceType: ValueSourceType.REQUEST_HEADER,
              },
              criteria: {
                source: 'bar',
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.EQUAL,
            },
          ],
        },
      },
    });
    const res = await commonProcessor.checkMatch();
    assert.ok(res);
  });
});
