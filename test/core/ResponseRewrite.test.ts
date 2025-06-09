import { assert, describe, it } from 'vitest';
import { ResponseRewrite } from '../../src/core';
import { TestUtil } from '../TestUtil';
import {
  MatchOperator,
  Operator,
  ResponseRewriteOperation,
  ResponseRewriteType,
  ValueSourceType,
} from '../../src/common/Enum';

describe('test/core/ResponseRewrite.test.ts', () => {
  describe('rewrite header', () => {
    it('should rewrite header set work', async () => {
      const ctx = TestUtil.mockRouteContext({
        url: 'https://www.example.com',
      });
      ctx.setResponse(
        TestUtil.mockResponse('ok', {
          'x-foo': 'bar',
        }),
      );
      const responseRewrite = new ResponseRewrite(
        {
          type: ResponseRewriteType.HEADER,
          field: 'x-foo',
          value: {
            source: 'baz',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: ResponseRewriteOperation.SET,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const response = await responseRewrite.rewrite(ctx.response!, ctx);
      assert.strictEqual(response.headers.get('x-foo'), 'baz');
    });

    it('should rewrite header append work', async () => {
      const ctx = TestUtil.mockRouteContext({
        url: 'https://www.example.com',
      });
      ctx.setResponse(
        TestUtil.mockResponse('ok', {
          'x-foo': 'bar',
        }),
      );
      const responseRewrite = new ResponseRewrite(
        {
          type: ResponseRewriteType.HEADER,
          field: 'x-foo',
          value: {
            source: 'baz',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: ResponseRewriteOperation.APPEND,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const response = await responseRewrite.rewrite(ctx.response!, ctx);
      assert.strictEqual(response.headers.get('x-foo'), 'bar, baz');
    });

    it('should rewrite header delete work', async () => {
      const ctx = TestUtil.mockRouteContext({
        url: 'https://www.example.com',
      });
      ctx.setResponse(
        TestUtil.mockResponse('ok', {
          'x-foo': 'bar',
        }),
      );
      const responseRewrite = new ResponseRewrite(
        {
          type: ResponseRewriteType.HEADER,
          field: 'x-foo',
          operation: ResponseRewriteOperation.DELETE,
        },
        TestUtil.mockCommonSubProcessor(),
      );
      const response = await responseRewrite.rewrite(ctx.response!, ctx);
      assert.strictEqual(response.headers.get('x-foo'), null);
    });
  });

  describe('extra match', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext({
        url: 'https://www.example.com?a=1',
      });
      ctx.setResponse(
        TestUtil.mockResponse('ok', {
          'x-foo': 'bar',
        }),
      );
      let responseRewrite = new ResponseRewrite(
        {
          type: ResponseRewriteType.HEADER,
          field: 'x-foo',
          value: {
            source: 'baz',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: ResponseRewriteOperation.SET,
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
            operator: MatchOperator.AND,
          },
        },
        TestUtil.mockCommonSubProcessor(),
      );
      let response = await responseRewrite.rewrite(ctx.response!, ctx);
      assert.strictEqual(response.headers.get('x-foo'), 'bar');

      responseRewrite = new ResponseRewrite(
        {
          type: ResponseRewriteType.HEADER,
          field: 'x-foo',
          value: {
            source: 'baz',
            sourceType: ValueSourceType.LITERAL,
          },
          operation: ResponseRewriteOperation.SET,
          match: {
            list: [
              {
                origin: {
                  source: 'a',
                  sourceType: ValueSourceType.QUERY,
                },
                criteria: {
                  source: '1',
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
      response = await responseRewrite.rewrite(ctx.response!, ctx);
      assert.strictEqual(response.headers.get('x-foo'), 'baz');
    });
  });
});
