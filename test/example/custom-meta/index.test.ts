import { describe, it, assert } from 'vitest';
import { fetchMock, TestUtil } from '../../TestUtil';
import { Route } from '../../../example/custom-meta/Route';
import { GroupProcessorType, SubProcessorType } from '../../../src/common/Enum';

describe('test/example/custom-meta', () => {
  it('should hostInfoRewrite work', async () => {
    fetchMock.get('https://test.example.com')
      .intercept({ method: 'get', path: '/' })
      .reply(200, 'test.example.com ok');

    const event = TestUtil.mockFetchEvent({
      url: 'https://test.example.com/',
    });
    const route = new Route({
      event,
    });
    await route.execute([
      {
        name: 'test',
        type: 'test',
        processor: GroupProcessorType.COMMON_GROUP_PROCESSOR,
        meta: {},
        args: {},
        routes: [
          {
            name: 'sub2',
            type: 'sub2',
            processor: SubProcessorType.COMMON_SUB_PROCESSOR,
            args: {},
            meta: {
              hostInfoRewrites: [
                {
                  operation: 'set',
                  field: 'platformId',
                  value: {
                    source: 'updated_platform_id',
                    sourceType: 'literal',
                  },
                },
              ],
            },
          },
        ],
      },
    ]);
    assert.equal(route.ctx.hostInfo?.platformId, 'updated_platform_id');
  });
});
