import { afterEach, vi } from 'vitest';
import { type MockAgent } from 'undici';
import sinon from 'sinon';
import { Response as RR } from 'undici';
import { ReadableStream, TransformStream, WritableStream } from 'node:stream/web';

declare global {
  function getMiniflareFetchMock(): MockAgent;
}

vi.stubGlobal('GET_KV_RESOURCE_TIMEOUT', 300);
// miniflare 的 Response 和 node 的不太一样 （不知道是不是 bug）
// const response = new Response()
// new Response(response.body)
// response.body 就会有个 reader，导致流被 lock
// node 环境下的 Response 则无此现象
vi.stubGlobal('Response', RR);
vi.stubGlobal('ReadableStream', ReadableStream);
vi.stubGlobal('WritableStream', WritableStream);
vi.stubGlobal('TransformStream', TransformStream);
afterEach(() => {
  sinon.restore();
});

export {};
