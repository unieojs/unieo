import { describe, it, assert, beforeEach, afterEach } from 'vitest';
import sinon from 'sinon';
import { SubExecutor } from '../../src/executor/SubExecutor';
import { CommonSubProcessor } from '../../src/processor';
import { TestUtil } from '../TestUtil';
import { type BaseError, ErrorCode } from '../../src/common/Error';
import { RouteContext, type SubProcessor } from '../../src/core';

describe('test/executor/SubExecutor.test.ts', () => {
  let ctx: RouteContext;
  let subProcessor: SubProcessor;
  let weakDepSubProcessor: SubProcessor;
  let subExecutor: SubExecutor;
  let weakDepSubExecutor: SubExecutor;
  let error: BaseError | null;

  beforeEach(() => {
    ctx = TestUtil.mockRouteContext();
    subProcessor = TestUtil.mockCommonSubProcessor(
      ctx,
      TestUtil.mockSubRouteConfig({
        meta: {
          redirects: TestUtil.mockRedirect(),
          requestRewrites: TestUtil.mockRequestRewrite(),
          responseRewrites: TestUtil.mockResponseRewrite(),
        },
      }),
    );
    weakDepSubProcessor = TestUtil.mockCommonSubProcessor(
      ctx,
      TestUtil.mockSubRouteConfig({
        meta: {
          weakDep: true,
          responseRewrites: TestUtil.mockResponseRewrite(),
        },
      }),
    );
    subExecutor = new SubExecutor(subProcessor, { ctx });
    weakDepSubExecutor = new SubExecutor(weakDepSubProcessor, { ctx });

    sinon.stub(RouteContext.prototype, 'logError').callsFake((err: BaseError | Error) => {
      error = err as BaseError;
    });
  });

  afterEach(() => {
    error = null;
  });

  it('should beforeRequest not exist work', async () => {
    sinon.stub(subProcessor, 'needBeforeRequest').value(false);
    const matchStub = sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.beforeRequest(ctx.request);
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
    assert.ok(matchStub.notCalled);
  });

  it('should beforeRequest no match work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.beforeRequest(ctx.request);
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
  });

  it('should beforeRequest work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'beforeRequest').resolves(TestUtil.mockRequest('https://new_request/'));
    let result = await subExecutor.beforeRequest(ctx.request);
    assert.ok(result.success);
    assert.ok(!result.break);
    assert.ok(!result.breakGroup);
    assert.strictEqual(result.result?.url, 'https://new_request/');

    sinon.stub(subProcessor, 'break').value(true);
    sinon.stub(subProcessor, 'breakGroup').value(true);
    result = await subExecutor.beforeRequest(ctx.request);
    assert.ok(result.success);
    assert.ok(result.break);
    assert.ok(result.breakGroup);
  });

  it('should beforeRequest fail work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'beforeRequest').rejects(new Error('test'));
    sinon.stub(subProcessor, 'break').value(true);
    sinon.stub(subProcessor, 'breakGroup').value(true);
    const subExecutor = new SubExecutor(subProcessor, { ctx });
    const result = await subExecutor.beforeRequest(ctx.request);
    assert.ok(!result.success);
    assert.ok(!result.break);
    assert.ok(!result.breakGroup);
    assert.strictEqual(error!.code, ErrorCode.SubRouteBeforeRequestError);
  });

  it('should beforeResponse not exist work', async () => {
    sinon.stub(subProcessor, 'needBeforeResponse').value(false);
    const matchStub = sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.beforeResponse(ctx.response);
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
    assert.ok(matchStub.notCalled);
  });

  it('should beforeResponse no match work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.beforeResponse(ctx.response);
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
  });

  it('should beforeResponse fail with weakDep work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'beforeResponse').rejects(new Error('test'));
    const result = await weakDepSubExecutor.beforeResponse(ctx.response);
    assert.ok(result.success);
    assert.strictEqual(error!.code, ErrorCode.SubRouteBeforeResponseError);
  });

  it('should beforeResponse work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'beforeResponse').resolves(TestUtil.mockResponse('new response'));
    let result = await subExecutor.beforeResponse(ctx.response);
    assert.ok(result.success);
    assert.ok(!result.break);
    assert.ok(!result.breakGroup);
    const text = await result.result?.text();
    assert.strictEqual(text, 'new response');

    sinon.stub(subProcessor, 'break').value(true);
    sinon.stub(subProcessor, 'breakGroup').value(true);
    result = await subExecutor.beforeResponse(ctx.response);
    assert.ok(result.success);
    assert.ok(result.break);
    assert.ok(result.breakGroup);
  });

  it('should beforeResponse fail work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'beforeResponse').rejects(new Error('test'));
    sinon.stub(subProcessor, 'break').value(true);
    sinon.stub(subProcessor, 'breakGroup').value(true);
    const subExecutor = new SubExecutor(subProcessor, { ctx });
    const result = await subExecutor.beforeResponse(ctx.response);
    assert.ok(!result.success);
    assert.ok(!result.break);
    assert.ok(!result.breakGroup);
    assert.strictEqual(error!.code, ErrorCode.SubRouteBeforeResponseError);
  });

  it('should redirect not exist work', async () => {
    sinon.stub(subProcessor, 'needRedirect').value(false);
    const matchStub = sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.redirect();
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
    assert.ok(matchStub.notCalled);
  });

  it('should redirect no match work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(false);
    const res = await subExecutor.redirect();
    assert.ok(res.success);
    assert.ok(!res.break);
    assert.ok(!res.breakGroup);
  });

  it('should redirect work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'redirect').resolves(TestUtil.mockResponse());
    const result = await subExecutor.redirect();
    assert.ok(result.success);
    assert.ok(result.break);
    assert.ok(result.breakGroup);
    assert.ok(result.result);
  });

  it('should redirect fail work', async () => {
    sinon.stub(CommonSubProcessor.prototype, 'checkMatch').resolves(true);
    sinon.stub(CommonSubProcessor.prototype, 'redirect').rejects(new Error('test'));
    sinon.stub(subProcessor, 'break').value(true);
    sinon.stub(subProcessor, 'breakGroup').value(true);
    const subExecutor = new SubExecutor(subProcessor, { ctx });
    const result = await subExecutor.redirect();
    assert.ok(!result.success);
    assert.ok(!result.break);
    assert.ok(!result.breakGroup);
    assert.strictEqual(error!.code, ErrorCode.SubRouteRedirectError);
  });
});
