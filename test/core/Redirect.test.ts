import { assert, describe, it } from 'vitest';
import { MatchOperator, Operator, RedirectType, ValueSourceType } from '../../src/common/Enum';
import { Redirect } from '../../src/core';
import { TestUtil } from '../TestUtil';

describe('test/core/Redirect.test.ts', () => {
  it('should extra match work', async () => {
    const redirect = new Redirect(
      {
        source: '/a/b/c',
        destination: 'https://www.exampleplus.com/?a=1&foo=baz',
        type: RedirectType.PATH,
        permanent: false,
        passQuery: true,
        match: {
          list: [
            {
              origin: {
                source: 'prodNo',
                sourceType: ValueSourceType.QUERY,
              },
              criteria: {
                source: '1234',
                sourceType: ValueSourceType.LITERAL,
              },
              operator: Operator.EQUAL,
            },
            {
              origin: {
                source: 'spNo',
                sourceType: ValueSourceType.QUERY,
              },
              criteria: {
                source: '5678',
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
    let ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/b/c?prodNo=1234&spNo=5678',
    });
    let response = await redirect.redirect(ctx);
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(
      response!.headers.get('location'),
      'https://www.exampleplus.com/?a=1&foo=baz&prodNo=1234&spNo=5678',
    );

    ctx = TestUtil.mockRouteContext({
      url: 'https://www.example.com/a/b/c?prodNo=1234',
    });
    response = await redirect.redirect(ctx);
    assert.strictEqual(response, null);
  });
});
