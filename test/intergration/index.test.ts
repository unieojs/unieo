import { assert, describe, it } from 'vitest';
import { Route } from '../../src';
import { fetchMock, TestUtil } from '../TestUtil';
import { GroupProcessorType, SubProcessorType } from '../../src/common/Enum';

describe('test/integration/index.text.ts', () => {
  it('should redirect work', async () => {
    const event = TestUtil.mockFetchEvent({
      url: 'https://test.example.com/a',
    });
    const route = new Route({
      event,
    });
    const response = await route.execute([
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
              redirects: [
                {
                  source: '/a',
                  destination: 'https://www.example.com/',
                  type: 'path',
                },
              ],
            },
          },
        ],
      },
    ]);
    assert.equal(response?.status, 302);
    assert.equal(response?.headers.get('Location'), 'https://www.example.com/');
  });

  it('should redirect with value work', async () => {
    const event = TestUtil.mockFetchEvent({
      url: 'https://test.example.com/a',
    });
    const route = new Route({
      event,
    });
    const response = await route.execute([
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
              redirects: {
                source: [
                  {
                    source: '/a',
                    destination: 'https://www.example.com/',
                    type: 'path',
                  },
                ],
                sourceType: 'literal',
                valueType: 'json',
              },
            },
          },
        ],
      },
    ]);
    assert.equal(response?.status, 302);
    assert.equal(response?.headers.get('Location'), 'https://www.example.com/');
  });

  it('should requestRewrite work', async () => {
    fetchMock.get('https://www.example.com')
      .intercept({ method: 'get', path: '/' })
      .reply(200, 'www.example.com ok');

    const event = TestUtil.mockFetchEvent({
      url: 'https://test.example.com/a',
    });
    const route = new Route({
      event,
    });
    const response = await route.execute([
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
              requestRewrites: [
                {
                  type: 'url',
                  field: 'href',
                  value: {
                    source: 'https://www.example.com/',
                    sourceType: 'literal',
                  },
                  operation: 'set',
                },
              ],
            },
          },
        ],
      },
    ]);

    assert(response);
    const text = await response.text();
    assert.equal(response.status, 200);
    assert.equal(text, 'www.example.com ok');
  });
});
