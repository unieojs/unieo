// import { assert, describe, it } from 'vitest';
// import sinon from 'sinon';
// import { GroupExecutor } from '../../src/executor/GroupExecutor';
// import { CommonGroupProcessor } from '../../src/processor';
// import { TestUtil } from '../TestUtil';
// import { SubExecutor } from '../../src/executor/SubExecutor';
//
// describe('test/executor/GroupExecutor.test.ts', () => {
//   const ctx = TestUtil.mockRouteContext();
//   ctx.setResponse(TestUtil.mockResponse());
//   const subProcessor = TestUtil.mockCommonSubProcessor(
//     ctx,
//     TestUtil.mockSubRouteConfig({
//       meta: {
//         redirects: TestUtil.mockRedirect(),
//         requestRewrites: TestUtil.mockRequestRewrite(),
//         responseRewrites: TestUtil.mockResponseRewrite(),
//       },
//     }),
//   );
//   const groupProcessor = TestUtil.mockCommonGroupProcessor(ctx, TestUtil.mockGroupRouteConfig(), [ subProcessor ]);
//   const breakGroupProcessor = TestUtil.mockCommonGroupProcessor(
//     ctx,
//     TestUtil.mockGroupRouteConfig({
//       meta: { isBreak: true },
//     }),
//     [ subProcessor ],
//   );
//   const multipleGroupProcessor = TestUtil.mockCommonGroupProcessor(ctx, TestUtil.mockGroupRouteConfig(), [
//     subProcessor,
//     subProcessor,
//   ]);
//   const groupExecutor = new GroupExecutor(groupProcessor, {
//     ctx,
//   });
//   const breakGroupExecutor = new GroupExecutor(breakGroupProcessor, {
//     ctx,
//   });
//   const multipleGroupExecutor = new GroupExecutor(multipleGroupProcessor, { ctx });
//
//   it('should beforeRequest no match work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(false);
//     const res = await groupExecutor.beforeRequest();
//     assert.deepStrictEqual(res, { success: true, break: false });
//   });
//
//   it('should beforeRequest no match and break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(false);
//     const res = await breakGroupExecutor.beforeRequest();
//     assert.deepStrictEqual(res, { success: true, break: false });
//   });
//
//   it('should beforeRequest success work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon
//       .stub(SubExecutor.prototype, 'beforeRequest')
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.request });
//     const result = await groupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: true, break: false });
//   });
//
//   it('should beforeRequest success and sub break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     const stub = sinon
//       .stub(SubExecutor.prototype, 'beforeRequest')
//       .onFirstCall()
//       .resolves({ success: true, break: true, breakGroup: false, result: ctx.request })
//       .onSecondCall()
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.request });
//     const result = await multipleGroupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: true, break: false });
//     assert.strictEqual(stub.callCount, 1);
//   });
//
//   it('should beforeRequest success and breakGroup work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     const stub = sinon
//       .stub(SubExecutor.prototype, 'beforeRequest')
//       .onFirstCall()
//       .resolves({ success: true, break: true, breakGroup: true, result: ctx.request })
//       .onSecondCall()
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.request });
//     const result = await multipleGroupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: true, break: true });
//     assert.strictEqual(stub.callCount, 1);
//   });
//
//   it('should beforeRequest fail work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'beforeRequest').resolves({ success: false, break: false, breakGroup: true });
//     const result = await groupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should beforeRequest fail and break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'beforeRequest').resolves({ success: false, break: false, breakGroup: true });
//     const result = await breakGroupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should beforeResponse no match work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(false);
//     const res = await groupExecutor.beforeResponse();
//     assert.deepStrictEqual(res, { success: true, break: false });
//   });
//
//   it('should beforeResponse no match and break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(false);
//     const res = await breakGroupExecutor.beforeResponse();
//     assert.deepStrictEqual(res, { success: true, break: false });
//   });
//
//   it('should beforeResponse success work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon
//       .stub(SubExecutor.prototype, 'beforeResponse')
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.response });
//     const result = await groupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: true, break: false });
//   });
//
//   it('should beforeResponse success and sub break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     const stub = sinon
//       .stub(SubExecutor.prototype, 'beforeResponse')
//       .onFirstCall()
//       .resolves({ success: true, break: true, breakGroup: false, result: ctx.response })
//       .onSecondCall()
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.response });
//     const result = await multipleGroupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: true, break: false });
//     assert.strictEqual(stub.callCount, 1);
//   });
//
//   it('should beforeResponse success and breakGroup work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     const stub = sinon
//       .stub(SubExecutor.prototype, 'beforeResponse')
//       .onFirstCall()
//       .resolves({ success: true, break: true, breakGroup: true, result: ctx.response })
//       .onSecondCall()
//       .resolves({ success: true, break: false, breakGroup: false, result: ctx.response });
//     const result = await multipleGroupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: true, break: true });
//     assert.strictEqual(stub.callCount, 1);
//   });
//
//   it('should beforeResponse fail work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon
//       .stub(SubExecutor.prototype, 'beforeResponse')
//       .resolves({ success: false, break: false, breakGroup: false });
//     const result = await groupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should beforeResponse fail and break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon
//      .stub(SubExecutor.prototype, 'beforeResponse')
//      .resolves({ success: false, break: false, breakGroup: false });
//     const result = await breakGroupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should redirect no match work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(false);
//     const res = await groupExecutor.redirect();
//     assert.deepStrictEqual(res, { success: true, break: false });
//   });
//
//   it('should redirect success work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon
//       .stub(SubExecutor.prototype, 'redirect')
//       .resolves({ success: true, break: true, breakGroup: true, result: ctx.response });
//     const result = await groupExecutor.redirect();
//     assert.deepStrictEqual(result, { success: true, break: true });
//   });
//
//   it('should redirect fail work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'redirect').resolves({ success: false, break: false, breakGroup: false });
//     const result = await groupExecutor.redirect();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should redirect fail and break work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'redirect').resolves({ success: false, break: false, breakGroup: false });
//     const result = await breakGroupExecutor.redirect();
//     assert.deepStrictEqual(result, { success: false, break: false });
//   });
//
//   it('should beforeRequest restore ctx work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'beforeRequest').callsFake(async request => {
//       // change ctx
//       request.headers.set('x-foo', 'bar');
//       ctx.requestInit.cdnProxy = false;
//       return {
//         success: false,
//         break: false,
//         breakGroup: false,
//         result: request,
//       };
//     });
//     const result = await groupExecutor.beforeRequest();
//     assert.deepStrictEqual(result, { success: false, break: false });
//     assert.deepStrictEqual(ctx.request.headers.get('x-foo'), null);
//     assert.strictEqual(ctx.requestInit.cdnProxy, undefined);
//   });
//
//   it('should beforeResponse restore ctx work', async () => {
//     sinon.stub(CommonGroupProcessor.prototype, 'checkMatch').resolves(true);
//     sinon.stub(SubExecutor.prototype, 'beforeResponse').callsFake(async response => {
//       // change ctx
//       response.headers.set('x-foo', 'bar');
//       return {
//         success: false,
//         break: false,
//         breakGroup: false,
//         result: response,
//       };
//     });
//     const result = await groupExecutor.beforeResponse();
//     assert.deepStrictEqual(result, { success: false, break: false });
//     assert.deepStrictEqual(ctx.response!.headers.get('x-foo'), null);
//   });
//
//   it('should break not work without subRoutes', async () => {
//     const groupProcessor = TestUtil.mockCommonGroupProcessor(
//       ctx,
//       TestUtil.mockGroupRouteConfig({
//         meta: { isBreak: true },
//       }),
//       [],
//     );
//     const groupExecutor = new GroupExecutor(groupProcessor, {
//       ctx,
//     });
//     let result = await groupExecutor.redirect();
//     assert.ok(result.success);
//     assert.ok(!result.break);
//
//     result = await groupExecutor.redirect();
//     assert.ok(result.success);
//     assert.ok(!result.break);
//
//     result = await groupExecutor.beforeRequest();
//     assert.ok(result.success);
//     assert.ok(!result.break);
//
//     result = await groupExecutor.beforeResponse();
//     assert.ok(result.success);
//     assert.ok(!result.break);
//   });
// });
