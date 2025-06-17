import { assert, describe, it } from 'vitest';
import { Value } from '../../src/core';
import { UrlValueType, ValueSourceType, ValueType } from '../../src/common/Enum';
import { fetchMock, TestUtil } from '../TestUtil';

describe('test/core/value.test.ts', () => {
  it('should literal work', async () => {
    const ctx = TestUtil.mockRouteContext();
    const value = new Value(
      {
        source: [ 'foo', 'bar' ],
        sourceType: ValueSourceType.LITERAL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const result = await value.get(ctx);
    assert.deepStrictEqual(result, [ 'foo', 'bar' ]);
  });

  it('should request_header work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: { 'x-render-uid': '123456789' },
    });
    let value = new Value(
      {
        source: 'x-render-uid',
        sourceType: ValueSourceType.REQUEST_HEADER,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, '123456789');
    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.REQUEST_HEADER,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });

  it('should response_header work', async () => {
    const ctx = TestUtil.mockRouteContext();
    ctx.setResponse(
      TestUtil.mockResponse('ok', {
        'x-content-version': 'SPRINT=1234',
      }),
    );
    let value = new Value(
      {
        source: 'x-content-version',
        sourceType: ValueSourceType.RESPONSE_HEADER,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, 'SPRINT=1234');
    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.RESPONSE_HEADER,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });

  it('should url work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.mybank.cn/p/yuyan/180123/test.html?a=1',
    });
    let value = new Value(
      {
        source: UrlValueType.HOST,
        sourceType: ValueSourceType.URL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, 'render.mybank.cn');

    value = new Value(
      {
        source: UrlValueType.HREF,
        sourceType: ValueSourceType.URL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, 'https://render.mybank.cn/p/yuyan/180123/test.html');

    value = new Value(
      {
        source: UrlValueType.PATH,
        sourceType: ValueSourceType.URL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, '/p/yuyan/180123/test.html');

    value = new Value(
      {
        source: UrlValueType.SUFFIX,
        sourceType: ValueSourceType.URL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, 'html');

    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.URL,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });
  it('should cookie work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        cookie: 'JSESSIONID=1234567890; foo=bar',
      },
    });
    let value = new Value(
      {
        source: 'JSESSIONID',
        sourceType: ValueSourceType.COOKIE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, '1234567890');
    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.COOKIE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });

  it('should query work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.oceanbase.com/?foo=bar',
    });
    let value = new Value(
      {
        source: 'foo',
        sourceType: ValueSourceType.QUERY,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, 'bar');
    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.QUERY,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });

  it('should fetch work', async () => {
    fetchMock
      .get('https://render.example.com')
      .intercept({ method: 'get', path: '/mock_value.json' })
      .reply(200, { foo: 'bar' });
    const ctx = TestUtil.mockRouteContext();
    const value = new Value(
      {
        source: 'https://render.example.com/mock_value.json',
        sourceType: ValueSourceType.FETCH,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const result = await value.get(ctx);
    assert.strictEqual((result as { foo: string }).foo, 'bar');
  });

  it('should route args work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: { 'x-foo': 'bar' },
    });
    let value = new Value(
      {
        source: 'foo',
        sourceType: ValueSourceType.ROUTE_ARGS,
      },
      TestUtil.mockCommonSubProcessor(ctx, {
        args: {
          foo: {
            source: 'x-foo',
            sourceType: 'request_header',
          },
        },
      }),
    );
    let result = await value.get(ctx);
    assert.strictEqual(result, 'bar');
    value = new Value(
      {
        source: 'not_exist',
        sourceType: ValueSourceType.ROUTE_ARGS,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    result = await value.get(ctx);
    assert.strictEqual(result, null);
  });

  it('should value_object work', async () => {
    const ctx = TestUtil.mockRouteContext();
    const value = new Value(
      {
        source: {
          test: {
            source: 'test',
            sourceType: ValueSourceType.LITERAL,
          },
          test2: {
            source: {
              test3: {
                source: 'test3',
                sourceType: ValueSourceType.LITERAL,
              },
            },
            sourceType: ValueSourceType.VALUE_OBJECT,
          },
        },
        sourceType: ValueSourceType.VALUE_OBJECT,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    assert.deepEqual(await value.get(ctx), {
      test: 'test',
      test2: {
        test3: 'test3',
      },
    });
  });

  describe('should valueType work', async () => {
    it('should json work', async () => {
      const ctx = TestUtil.mockRouteContext();
      let value = new Value(
        {
          source: '{"foo": "bar"}',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.JSON,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.deepStrictEqual(result, { foo: 'bar' });
      value = new Value(
        {
          source: '{"foo":',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.JSON,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, null);
    });

    it('should string work', async () => {
      const ctx = TestUtil.mockRouteContext();
      let value = new Value(
        {
          source: 123,
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.STRING,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.strictEqual(result, '123');

      value = new Value(
        {
          source: { foo: 'bar' },
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.STRING,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, '{"foo":"bar"}');

      value = new Value(
        {
          source: '',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.STRING,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, '');

      value = new Value(
        {
          source: null,
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.STRING,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, null);

      value = new Value(
        {
          source: undefined,
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.STRING,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, null);
    });

    it('should boolean work', async () => {
      const ctx = TestUtil.mockRouteContext();
      let value = new Value(
        {
          source: 'true',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.BOOLEAN,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.strictEqual(result, true);
      value = new Value(
        {
          source: '',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.BOOLEAN,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, false);
    });

    it('should number work', async () => {
      const ctx = TestUtil.mockRouteContext();
      let value = new Value(
        {
          source: '1234',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.NUMBER,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.strictEqual(result, 1234);
      value = new Value(
        {
          source: '',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.NUMBER,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, 0);
    });

    it('should integer work', async () => {
      const ctx = TestUtil.mockRouteContext();
      let value = new Value(
        {
          source: '1234',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.INTEGER,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.strictEqual(result, 1234);

      value = new Value(
        {
          source: '',
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.INTEGER,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.ok(Number.isNaN(result));

      value = new Value(
        {
          source: null,
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.INTEGER,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.ok(Number.isNaN(result));
    });
  });

  describe('string template', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext({
        headers: {
          'x-foo': 'baz',
        },
        url: 'https://render.example.com/p/yuyan/180123/test.html?a=1',
      });
      let value = new Value(
        {
          source: '<meta "name"="unio_origin_url" "content"="https://mock_url">',
          sourceType: ValueSourceType.STRING_TEMPLATE,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let result = await value.get(ctx);
      assert.strictEqual(result, '<meta "name"="unio_origin_url" "content"="https://mock_url">');

      value = new Value(
        {
          source: '<meta "name"="unio_origin_url" "content"="${ctx.href}">',
          sourceType: ValueSourceType.STRING_TEMPLATE,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      result = await value.get(ctx);
      assert.strictEqual(
        result,
        '<meta "name"="unio_origin_url" "content"="https://render.example.com/p/yuyan/180123/test.html?a=1">',
      );

      value = new Value(
        {
          source: '<meta "name"="unio_origin_url" "content"="${args.foo}|${args["x-foo-header"]}">',
          sourceType: ValueSourceType.STRING_TEMPLATE,
        },
        TestUtil.mockCommonSubProcessor(ctx, {
          args: {
            foo: {
              source: 'bar',
              sourceType: 'literal',
            },
            'x-foo-header': {
              source: 'x-foo',
              sourceType: 'request_header',
            },
          },
        }),
      );
      result = await value.get(ctx);
      assert.strictEqual(result, '<meta "name"="unio_origin_url" "content"="bar|baz">');
    });
  });

  it('should return null when error', async () => {
    const ctx = TestUtil.mockRouteContext();
    const value = new Value(
      {
        source: '${not_exits_key}',
        sourceType: ValueSourceType.STRING_TEMPLATE,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const result = await value.get(ctx);
    assert.strictEqual(result, '');
  });

  describe('match value type', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext();
      const value = new Value(
        {
          source: {
            list: [
              {
                origin: {
                  source: 'foo',
                  sourceType: ValueSourceType.LITERAL,
                },
                criteria: {
                  source: 'foo',
                  sourceType: ValueSourceType.LITERAL,
                },
                operator: 'equal',
              },
              {
                origin: {
                  source: 'foo',
                  sourceType: ValueSourceType.LITERAL,
                },
                criteria: {
                  source: 'bar',
                  sourceType: ValueSourceType.LITERAL,
                },
                operator: 'equal',
              },
            ],
            operator: 'and',
          },
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.MATCH,
        },
        TestUtil.mockCommonSubProcessor(ctx),
      );
      const result = await value.get(ctx);
      assert.strictEqual(result, false);
    });

    it('bad match should return true', async () => {
      const ctx = TestUtil.mockRouteContext();
      const value = new Value(
        {
          source: {
            list: [
              {
                // 只有 criteria 是不合法的
                criteria: {
                  source: 'bar',
                  sourceType: ValueSourceType.LITERAL,
                },
                operator: 'in',
              },
            ],
            operator: 'and',
          },
          sourceType: ValueSourceType.LITERAL,
          valueType: ValueType.MATCH,
        },
        TestUtil.mockCommonSubProcessor(ctx),
      );
      const result = await value.get(ctx);
      assert.strictEqual(result, true);
    });
  });
});
