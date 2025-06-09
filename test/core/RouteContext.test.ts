import assert from 'assert';
import { noop } from 'lodash';
import sinon from 'sinon';
import { describe, expect, it, vi } from 'vitest';
import { ErrorCode, genError } from '../../src/common/Error';
import { TestUtil } from '../TestUtil';
import { type ILogger } from '../../src/types';

describe('test/core/RouteContext.test.ts', () => {
  describe('appendExtInfoToResponse', () => {
    it('should work', () => {
      const ctx = TestUtil.mockRouteContext();
      ctx.logError(
        genError(ErrorCode.EdgeKVTimeoutError, {
          message: 'mock_message',
          summary: 'foo',
          stack: 'mock_stack',
        }),
      );
      ctx.logError(
        genError(ErrorCode.EdgeKVRequestError, {
          message: 'mock_message',
          summary: 'bar',
          stack: 'mock_stack',
        }),
      );
      const res = new Response('ok');
      const newRes = ctx.appendExtInfoToResponse(res);
      const xRenderRouteError = newRes.headers.get('x-unio-error');
      assert.strictEqual(xRenderRouteError, '2003_foo|2002_bar');
    });

    it('should empty work', () => {
      const ctx = TestUtil.mockRouteContext();
      ctx.logError(new Error('mock_message'));
      const res = new Response('ok');
      const newRes = ctx.appendExtInfoToResponse(res);
      const xRenderRouteError = newRes.headers.get('x-unio-error');
      assert.strictEqual(xRenderRouteError, '3001');
    });
  });

  describe('fallback', () => {
    it('should work', async () => {
      const ctx = TestUtil.mockRouteContext();
      const requestStub = sinon.stub(ctx.httpClient, 'request').callsFake(async (_, options) => {
        assert.deepStrictEqual(options, {
          unioFallback: true,
        });
        return new Response('ok');
      });
      await ctx.fallback();
      assert.ok(requestStub.calledOnce);
    });
  });

  describe('logError', () => {
    it('should keep message simple', async () => {
      const ctx = TestUtil.mockRouteContext();
      const logErrorSpy = vi.fn(noop);
      ctx.logger.error = logErrorSpy;
      ctx.logError(
        genError(ErrorCode.SystemError, {
          message: 'mock_message',
          details: 'foo',
          stack: new Error('mock_message').stack,
        }),
      );
      expect(logErrorSpy.mock.calls[0][0]).toContain('3001 foo\nError: mock_message\n');
    });

    it('origin logger object should not be modified', async () => {
      const errorMock = vi.fn(noop);
      const infoMock = vi.fn(noop);
      const warnMock = vi.fn(noop);
      const logMock = vi.fn(noop);
      const debugMock = vi.fn(noop);
      const logger: ILogger = {
        error: errorMock,
        info: infoMock,
        warn: warnMock,
        log: logMock,
        debug: debugMock,
      };
      const ctx = TestUtil.mockRouteContext({ helper: { logger } });
      ctx.logError(
        genError(ErrorCode.SystemError, {
          message: 'mock_message',
          details: 'foo',
          stack: new Error('mock_message').stack,
        }),
      );
      expect(errorMock.mock.calls[0][0]).toContain('3001 foo\nError: mock_message\n');
      expect(logger.error).toBe(errorMock);
      expect(logger.info).toBe(infoMock);
      expect(logger.warn).toBe(warnMock);
      expect(logger.log).toBe(logMock);
      expect(logger.debug).toBe(debugMock);
    });
  });
});
