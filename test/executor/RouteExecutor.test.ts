import { describe, it, assert } from 'vitest';
import sinon from 'sinon';
import { RouteExecutor } from '../../src/executor/RouteExecutor';
import { TestUtil, fetchMock } from '../TestUtil';
import { GroupExecutor } from '../../src/executor/GroupExecutor';

describe('test/executor/RouteExecutor.test.ts', () => {
  it('should execute work', async () => {
    fetchMock.get('https://mock_pack_route_executor.com').intercept({ method: 'get', path: '/' }).reply(200, 'ok');
    const ctx = TestUtil.mockRouteContext({
      url: 'https://mock_pack_route_executor.com',
    });
    const packRouteProcessor = TestUtil.mockRouteProcessor({
      groupProcessors: [ TestUtil.mockCommonGroupProcessor(ctx), TestUtil.mockCommonGroupProcessor(ctx) ],
      helper: TestUtil.mockHelper(),
    });
    const packExecutor = new RouteExecutor(packRouteProcessor, {
      ctx,
    });
    sinon.stub(GroupExecutor.prototype, 'redirect').resolves({
      success: true,
      break: false,
    });
    sinon.stub(GroupExecutor.prototype, 'beforeRequest').resolves({
      success: true,
      break: false,
    });
    sinon.stub(GroupExecutor.prototype, 'beforeResponse').resolves({
      success: true,
      break: false,
    });
    await packExecutor.execute();
    const text = await ctx.response!.text();
    assert.strictEqual(ctx.response!.status, 200);
    assert.strictEqual(text, 'ok');
  });

  it('should execute with group break work', async () => {
    fetchMock.get('https://mock_pack_route_executor.com').intercept({ method: 'get', path: '/' }).reply(200, 'ok');
    const ctx = TestUtil.mockRouteContext({
      url: 'https://mock_pack_route_executor.com',
    });
    const packRouteProcessor = TestUtil.mockRouteProcessor({
      groupProcessors: [
        TestUtil.mockCommonGroupProcessor(ctx, {
          meta: { isBreak: true },
        }),
        TestUtil.mockCommonGroupProcessor(ctx),
      ],
      helper: TestUtil.mockHelper(),
    });
    const packExecutor = new RouteExecutor(packRouteProcessor, {
      ctx,
    });
    const beforeRequestStub = sinon.stub(GroupExecutor.prototype, 'beforeRequest');
    const beforeResponseStub = sinon.stub(GroupExecutor.prototype, 'beforeResponse');
    beforeRequestStub.onFirstCall().callsFake(async () => {
      return {
        success: true,
        break: true,
      };
    });
    beforeRequestStub.onSecondCall().callsFake(async () => {
      // 修改 ctx.request ，不会生效
      ctx.setRequest(TestUtil.mockRequest('https://mock_pack_route_executor.com/invalid'));
      return {
        success: true,
        break: true,
      };
    });
    beforeResponseStub.onFirstCall().callsFake(async () => {
      return {
        success: true,
        break: true,
      };
    });
    beforeResponseStub.onSecondCall().callsFake(async () => {
      // 修改 ctx.response ，不会生效
      ctx.setResponse(TestUtil.mockResponse('invalid'));
      return {
        success: true,
        break: true,
      };
    });
    await packExecutor.execute();
    const text = await ctx.response!.text();
    assert.strictEqual(ctx.response!.status, 200);
    assert.strictEqual(text, 'ok');
  });

  it('should execute with redirect work', async () => {
    const ctx = TestUtil.mockRouteContext({
      url: 'https://mock_pack_route_executor.com',
    });
    const packRouteProcessor = TestUtil.mockRouteProcessor({
      groupProcessors: [ TestUtil.mockCommonGroupProcessor(ctx) ],
      helper: TestUtil.mockHelper(),
    });
    const packExecutor = new RouteExecutor(packRouteProcessor, {
      ctx,
    });
    sinon.stub(GroupExecutor.prototype, 'redirect').callsFake(async () => {
      ctx.setResponse(Response.redirect('https://mock_pack_route_executor.com/redirect', 301));
      return {
        success: true,
        break: true,
      };
    });
    const beforeRequestStub = sinon.stub(GroupExecutor.prototype, 'beforeRequest').resolves({
      success: true,
      break: false,
    });
    const beforeResponseStub = sinon.stub(GroupExecutor.prototype, 'beforeResponse').resolves({
      success: true,
      break: false,
    });
    await packExecutor.execute();
    assert.strictEqual(ctx.response!.status, 301);
    assert.strictEqual(ctx.response!.headers.get('location'), 'https://mock_pack_route_executor.com/redirect');
    assert(beforeRequestStub.notCalled);
    assert(beforeResponseStub.notCalled);
  });

  it('should execute with middleware work', async () => {
    fetchMock
      .get('https://mock_pack_route_executor.com')
      .intercept({ method: 'get', path: '/index.html' })
      .reply(200, 'ok');

    fetchMock
      .get('https://mock_pack_route_executor.com')
      .intercept({ method: 'get', path: '/new_index.html' })
      .reply(400, 'error');
    const ctx = TestUtil.mockRouteContext({
      url: 'https://mock_pack_route_executor.com/index.html',
    });
    // 设置 middleware
    ctx.setMiddlewares([
      [ 'DefaultFetch', {} ],
      [ 'ErrorFallback', {} ],
    ]);
    // 修改 request
    ctx.setRequest(TestUtil.mockRequest('https://mock_pack_route_executor.com/new_index.html'));
    const packRouteProcessor = TestUtil.mockRouteProcessor({
      groupProcessors: [ TestUtil.mockCommonGroupProcessor(ctx), TestUtil.mockCommonGroupProcessor(ctx) ],
      helper: TestUtil.mockHelper(),
    });
    const packExecutor = new RouteExecutor(packRouteProcessor, {
      ctx,
    });
    sinon.stub(GroupExecutor.prototype, 'beforeRequest').resolves({
      success: true,
      break: false,
    });
    sinon.stub(GroupExecutor.prototype, 'beforeResponse').resolves({
      success: true,
      break: false,
    });
    await packExecutor.execute();
    const text = await ctx.response!.text();
    assert.strictEqual(ctx.response!.status, 200);
    assert.strictEqual(text, 'ok');
  });
});
