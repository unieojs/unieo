import { assert, describe, it } from 'vitest';
import {
  MatchOperator,
  Operator,
  RequestRewriteType,
  RewriteOperation,
  UrlValueType,
  ValueSourceType,
} from '../../src/common/Enum';
import { ErrorCode, type BaseError } from '../../src/common/Error';
import { RequestRewrite } from '../../src/core';
import { PathRegexpType } from '../../src/util/PathRegexp';
import { TestUtil } from '../TestUtil';

describe('test/core/RequestRewrite.test.ts', () => {
  it('should rewrite url set host work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
      headers: {
        cookie: 'mock_cookie',
        'custom-test-header': 'mock_custom-test-header',
      },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.HOST,
        value: {
          source: 'www.exampleplus.com',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.exampleplus.com/');
    assert.strictEqual(request.headers.get('cookie'), 'mock_cookie');
    assert.strictEqual(request.headers.get('custom-test-header'), null);
  });

  it('should rewrite url set path work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
      headers: {
        cookie: 'mock_cookie',
        'custom-test-header': 'mock_custom-test-header',
      },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.PATH,
        value: {
          source: '/a/b/index.html',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.example.com/a/b/index.html');
    assert.strictEqual(request.headers.get('cookie'), 'mock_cookie');
    assert.strictEqual(request.headers.get('custom-test-header'), null);
  });

  it('should rewrite url set href work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?foo=bar',
      headers: {
        cookie: 'mock_cookie',
        'custom-test-header': 'mock_custom-test-header',
      },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.HREF,
        value: {
          source: 'https://www.exampleplus.com/a/b/index.html',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.exampleplus.com/a/b/index.html?foo=bar');
    assert.strictEqual(request.headers.get('cookie'), 'mock_cookie');
    assert.strictEqual(request.headers.get('custom-test-header'), null);
  });

  it('should rewrite url set href and path work with path_regexp', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/b/c/xxhh.html?foo=bar',
    });
    let requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.HREF,
        value: {
          source: {
            source: 'https://www.example.com/:id1/:id2/:id3/(.*)',
            destination: 'https://www.exampleplus.com/:id1-:id2-:id3/(.*)',
            type: PathRegexpType.PATH_REGEXP,
          },
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );

    let request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.exampleplus.com/a-b-c/xxhh.html?foo=bar');

    requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.PATH,
        value: {
          source: {
            source: '/:id1/:id2/:id3/(.*)',
            destination: '/:id1-:id2-:id3/(.*)',
            type: PathRegexpType.PATH_REGEXP,
          },
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );

    request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.example.com/a-b-c/xxhh.html?foo=bar');

    requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.HREF,
        value: {
          source: {
            source: 'https://www.example.com/a/b/c/xxhh.html',
            destination: 'https://www.exampleplus.com/a-b-c/xxhh.html',
            type: PathRegexpType.EXACT,
          },
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.exampleplus.com/a-b-c/xxhh.html?foo=bar');
  });

  it('should rewrite set header work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.URL,
        field: UrlValueType.HREF,
        value: {
          source: 'https://www.exampleplus.com/a/b/index.html',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.exampleplus.com/a/b/index.html');
  });

  it('should rewrite delete header work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
      headers: { 'x-foo': 'bar' },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.HEADER,
        field: 'x-foo',
        operation: RewriteOperation.DELETE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.headers.get('x-foo'), null);
  });

  it('should rewrite append header work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
      headers: { 'x-foo': 'bar' },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.HEADER,
        field: 'x-foo',
        value: {
          source: 'baz',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.APPEND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.headers.get('x-foo'), 'bar, baz');
  });

  it('should rewrite set header work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com',
      headers: { 'x-foo': 'bar' },
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.HEADER,
        field: 'x-foo',
        value: {
          source: 'baz',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.headers.get('x-foo'), 'baz');
  });

  it('should rewrite set query work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.QUERY,
        field: 'a',
        value: {
          source: '3',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.example.com/?a=3&b=2');
  });

  it('should rewrite delete query work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.QUERY,
        field: 'a',
        operation: RewriteOperation.DELETE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.example.com/?b=2');
  });

  it('should rewrite append query work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.QUERY,
        field: 'a',
        value: {
          source: '3',
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.APPEND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const request = await requestRewrite.rewrite(ctx.request, ctx);
    assert.strictEqual(request.url, 'https://www.example.com/?a=1&b=2&a=3');
  });

  it('should rewrite cdnProxy work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.REQUEST_INIT,
        field: 'cdnProxy',
        value: {
          source: false,
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    await requestRewrite.rewrite(ctx.request, ctx);
    assert.deepStrictEqual(ctx.requestInit, {
      cdnProxy: false,
    });
  });

  it('should rewrite middleware work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    let requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.MIDDLEWARE,
        field: '',
        value: {
          source: [ 'DefaultFetch' ],
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    await requestRewrite.rewrite(ctx.request, ctx);
    assert.deepStrictEqual(ctx.middlewares, [ [ 'DefaultFetch', {} ] ]);

    requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.MIDDLEWARE,
        field: '',
        value: {
          source: [
            [
              'ErrorFallback',
              {
                option: {
                  foo: {
                    source: 'bar',
                    sourceType: ValueSourceType.LITERAL,
                  },
                  uid: {
                    source: 'a',
                    sourceType: ValueSourceType.QUERY,
                  },
                },
              },
            ],
          ],
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.APPEND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    await requestRewrite.rewrite(ctx.request, ctx);
    assert.deepStrictEqual(ctx.middlewares, [
      [ 'DefaultFetch', {} ],
      [ 'ErrorFallback', { foo: 'bar', uid: '1' } ],
    ]);

    requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.MIDDLEWARE,
        field: '',
        operation: RewriteOperation.DELETE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    await requestRewrite.rewrite(ctx.request, ctx);
    assert.deepStrictEqual(ctx.middlewares, []);
  });

  it('should rewrite middleware work with match', async () => {
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.MIDDLEWARE,
        field: '',
        value: {
          source: [
            'DefaultFetch',
            [
              'ErrorFallback',
              {
                match: {
                  list: [
                    {
                      origin: {
                        source: 'a',
                        sourceType: ValueSourceType.QUERY,
                      },
                      criteria: {
                        source: 'xxhh',
                        sourceType: ValueSourceType.LITERAL,
                      },
                      operator: Operator.EQUAL,
                    },
                  ],
                },
              },
            ],
          ],
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });
    await requestRewrite.rewrite(ctx.request, ctx);
    assert.deepStrictEqual(ctx.middlewares, [ [ 'DefaultFetch', {} ] ]);
    const ctx2 = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=xxhh&b=2',
    });
    await requestRewrite.rewrite(ctx2.request, ctx2);
    assert.deepStrictEqual(ctx2.middlewares, [
      [ 'DefaultFetch', {} ],
      [ 'ErrorFallback', {} ],
    ]);
  });

  it('should rewrite middleware failed with invalid config', async () => {
    const requestRewrite = new RequestRewrite(
      {
        type: RequestRewriteType.MIDDLEWARE,
        field: '',
        value: {
          source: [ 'InvalidMiddleware' ],
          sourceType: ValueSourceType.LITERAL,
        },
        operation: RewriteOperation.SET,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com?a=1&b=2',
    });

    try {
      await requestRewrite.rewrite(ctx.request, ctx);
      assert.fail('should not execute');
    } catch (err) {
      assert.strictEqual((err as BaseError).code, ErrorCode.RequestMiddlewareNotFoundError);
    }
  });

  describe('extra match', () => {
    it('should work', async function () {
      const ctx = TestUtil.mockRouteContext({
        url: 'https://www.example.com',
        headers: {
          cookie: 'mock_cookie',
          'custom-test-header': 'mock_custom-test-header',
        },
      });
      let requestRewrite = new RequestRewrite(
        {
          type: RequestRewriteType.URL,
          field: UrlValueType.HOST,
          value: {
            source: 'www.exampleplus.com',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: RewriteOperation.SET,
          match: {
            list: [
              {
                origin: {
                  source: 'cookie',
                  sourceType: ValueSourceType.REQUEST_HEADER,
                },
                criteria: {
                  source: 'mock_cookie_1234',
                  sourceType: ValueSourceType.LITERAL,
                },
                operator: Operator.EQUAL,
              },
            ],
            operator: MatchOperator.AND,
          },
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let request = await requestRewrite.rewrite(ctx.request, ctx);
      assert.strictEqual(request.url, 'https://www.example.com/');

      requestRewrite = new RequestRewrite(
        {
          type: RequestRewriteType.URL,
          field: UrlValueType.HOST,
          value: {
            source: 'www.exampleplus.com',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: RewriteOperation.SET,
          match: {
            list: [
              {
                origin: {
                  source: 'cookie',
                  sourceType: ValueSourceType.REQUEST_HEADER,
                },
                criteria: {
                  source: 'mock_cookie',
                  sourceType: ValueSourceType.LITERAL,
                },
                operator: Operator.EQUAL,
              },
            ],
            operator: MatchOperator.AND,
          },
        },
        TestUtil.mockCommonSubProcessor(),
      );
      request = await requestRewrite.rewrite(ctx.request, ctx);
      assert.strictEqual(request.url, 'https://www.exampleplus.com/');
      assert.strictEqual(request.headers.get('cookie'), 'mock_cookie');
      assert.strictEqual(request.headers.get('custom-test-header'), null);
    });
  });
});
