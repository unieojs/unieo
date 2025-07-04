import { assert, describe, it } from 'vitest';
import { Match, type RawMatch } from '../../src/core';
import { TestUtil } from '../TestUtil';
import { MatchOperator, Operator, UrlValueType, ValueSourceType, ValueType } from '../../src/common/Enum';

describe('test/core/Match.test.ts', () => {
  const logger = TestUtil.mockHelper().logger;
  it('should empty list work', async () => {
    const match = new Match(
      {
        list: [],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(TestUtil.mockRouteContext(), logger);
    assert.ok(res);
  });
  it('should equal work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
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
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });
  it('should not equal work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 'baz',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_EQUAL,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });
  describe('in', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext({
        headers: {
          'x-foo': 'bar',
        },
      });
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: 'x-foo',
                sourceType: ValueSourceType.REQUEST_HEADER,
              },
              criteria: {
                source: [ 'bar', 'baz' ],
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.IN,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });

    it('should work with null', async function () {
      const ctx = TestUtil.mockRouteContext({
        headers: {
          'x-foo': 'bar',
        },
      });
      const match = new Match(
        {
          list: [
            {
              // null
              origin: {
                source: 'x-foo1',
                sourceType: ValueSourceType.REQUEST_HEADER,
              },
              criteria: {
                source: null,
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.IN,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert(!res);
    });
  });

  describe('not in', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext({
        headers: {
          'x-foo': 'bar',
        },
      });
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: 'x-foo',
                sourceType: ValueSourceType.REQUEST_HEADER,
              },
              criteria: {
                source: [ 'baz', 'qux' ],
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.NOT_IN,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });

    it('should work with null', async function () {
      const ctx = TestUtil.mockRouteContext({
        headers: {
          'x-foo': 'bar',
        },
      });
      const match = new Match(
        {
          list: [
            {
              // null
              origin: {
                source: 'x-foo1',
                sourceType: ValueSourceType.REQUEST_HEADER,
              },
              // null
              criteria: {
                source: null,
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.NOT_IN,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert(!res);
    });
  });

  it('should gte work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-ldcid-level': '30',
      },
    });
    let match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 20,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.GTE,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let res = await match.match(ctx, logger);
    assert.ok(res);

    match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 30,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.GTE,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should gt work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-ldcid-level': '30',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 20,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.GT,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should lte work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-ldcid-level': '30',
      },
    });
    let match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 40,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.LTE,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let res = await match.match(ctx, logger);
    assert.ok(res);

    match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 30,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.LTE,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should lt work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-ldcid-level': '30',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-ldcid-level',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 40,
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.LTE,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should null work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-render-uid',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            operator: Operator.NULL,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should not null work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            operator: Operator.NOT_NULL,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should null and not null work with empty string', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/?foo=',
    });
    let match = new Match(
      {
        list: [
          {
            origin: {
              source: 'foo',
              sourceType: ValueSourceType.QUERY,
            },
            operator: Operator.NULL,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let res = await match.match(ctx, logger);
    assert.ok(res);

    match = new Match(
      {
        list: [
          {
            origin: {
              source: 'foo',
              sourceType: ValueSourceType.QUERY,
            },
            operator: Operator.NOT_NULL,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    res = await match.match(ctx, logger);
    assert.ok(!res);
  });

  it('should regexp work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': '1234566',
      },
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: '^\\d+$',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.REGEXP,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should not_regexp work', async () => {
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: '^\\d+$',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_REGEXP,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': '123456ABC',
      },
    });
    let res = await match.match(ctx, logger);
    assert.ok(res);

    // origin is null
    ctx = TestUtil.mockRouteContext();

    res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should path_regexp work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/1/c',
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.PATH,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: '/a/:id/c',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.PATH_REGEXP,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should not_path_regexp work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/1/c',
    });
    const match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.PATH,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: '/:id/c',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_PATH_REGEXP,
          },
        ],
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should or list work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
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
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 'baz',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.EQUAL,
          },
        ],
        operator: MatchOperator.OR,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });
  it('should and list work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
      },
    });
    const match = new Match(
      {
        list: [
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
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 'baz',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.EQUAL,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(!res);
  });

  it('should match nest work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: {
        'x-foo': 'bar',
        'x-a': 'b',
      },
    });

    const nestedRawMatch: RawMatch = {
      list: [
        {
          origin: {
            source: 'x-a',
            sourceType: ValueSourceType.REQUEST_HEADER,
          },
          criteria: {
            source: 'b',
            sourceType: ValueSourceType.LITERAL,
          },
          operator: Operator.EQUAL,
        },
        {
          origin: {
            source: 'x-foo',
            sourceType: ValueSourceType.REQUEST_HEADER,
          },
          criteria: {
            source: 'baz',
            sourceType: ValueSourceType.LITERAL,
          },
          operator: Operator.EQUAL,
        },
      ],
      operator: MatchOperator.OR,
    };
    const match = new Match(
      {
        list: [
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
          nestedRawMatch,
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should prefix work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.example.com/rsc/xxx',
    });

    const match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.HREF,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: 'https://render.example.com/rsc/',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.PREFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should not_prefix work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.example.com/other/xxx',
    });

    let match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.HREF,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: 'https://render.example.com/rsc/',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_PREFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let res = await match.match(ctx, logger);
    assert.ok(res);

    match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 'abc',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_PREFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should suffix work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.example.com/p/yuyan/1801234/index.xml?a=1',
    });

    const match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.HREF,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: '.xml',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.SUFFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    const res = await match.match(ctx, logger);
    assert.ok(res);
  });

  it('should not_suffix work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.example.com/p/yuyan/1801234/index.xml?a=1',
    });

    let match = new Match(
      {
        list: [
          {
            origin: {
              source: UrlValueType.HREF,
              sourceType: ValueSourceType.URL,
            },
            criteria: {
              source: '.html',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_SUFFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    let res = await match.match(ctx, logger);
    assert.ok(res);

    match = new Match(
      {
        list: [
          {
            origin: {
              source: 'x-foo',
              sourceType: ValueSourceType.REQUEST_HEADER,
            },
            criteria: {
              source: 'abc',
              sourceType: ValueSourceType.LITERAL,
            },
            operator: Operator.NOT_SUFFIX,
          },
        ],
        operator: MatchOperator.AND,
      },
      TestUtil.mockCommonSubProcessor(),
    );
    res = await match.match(ctx, logger);
    assert.ok(res);
  });

  describe('should app version comparison work well', () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://render.example.com/p/yuyan/1801234/index.xml?a=1',
    });

    it('should gt work well', async () => {
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: '10.5.99.02',
                sourceType: ValueSourceType.LITERAL,
              },
              criteria: {
                source: '10.5.85.02',
                sourceType: ValueSourceType.LITERAL,
                valueType: ValueType.VERSION_STRING,
              },
              operator: Operator.GT,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });

    it('should lt work well', async () => {
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: '10.5.00.02',
                sourceType: ValueSourceType.LITERAL,
              },
              criteria: {
                source: '10.5.86.02',
                sourceType: ValueSourceType.LITERAL,
                valueType: ValueType.VERSION_STRING,
              },
              operator: Operator.LT,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });
  });

  describe('NaN', () => {
    const ctx = TestUtil.mockRouteContext({});

    it('should NaN work', async () => {
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: 'x-foo',
                sourceType: ValueSourceType.LITERAL,
                valueType: ValueType.INTEGER,
              },
              operator: Operator.NAN,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });

    it('should not NaN work', async () => {
      const match = new Match(
        {
          list: [
            {
              origin: {
                source: '1',
                sourceType: ValueSourceType.LITERAL,
                valueType: ValueType.INTEGER,
              },
              operator: Operator.NUMBER,
            },
          ],
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const res = await match.match(ctx, logger);
      assert.ok(res);
    });
  });
});
