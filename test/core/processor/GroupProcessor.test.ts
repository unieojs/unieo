import { assert, describe, it } from 'vitest';
import { TestUtil } from '../../TestUtil';
import { Operator, ValueSourceType } from '../../../src/common/Enum';

describe('test/core/processor/GroupProcessor.test.ts', () => {
  it('should checkMatch work', async () => {
    const ctx = TestUtil.mockRouteContext({
      headers: { 'x-foo': 'bar' },
    });
    const processor = TestUtil.mockCommonGroupProcessor(
      ctx,
      TestUtil.mockGroupRouteConfig({
        meta: {
          match: {
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
        },
      }),
      [],
    );
    const res = await processor.checkMatch();
    assert.ok(res);
  });
});
