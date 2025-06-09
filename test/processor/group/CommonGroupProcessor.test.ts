import { describe, it, assert } from 'vitest';
import { TestUtil } from '../../TestUtil';
import { ValueSourceType } from '../../../src/common/Enum';

describe('test/processor/group/CommonGroupProcessor.test.ts', () => {
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
                operator: 'equal',
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
