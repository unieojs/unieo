import { assert, describe, it } from 'vitest';
import { type RedirectData, RedirectHelper } from '../../src/util/RedirectHelper';
import { RedirectType } from '../../src/common/Enum';

describe('test/util/RedirectHelper.test.ts', () => {
  it('should permanent work', async () => {
    const redirect = new RedirectHelper({
      permanent: true,
      source: '/',
      destination: 'https://www.example.com/',
      type: RedirectType.PATH,
    });
    const response = redirect.redirect(new URL('https://demo.example.com'));
    assert.strictEqual(response!.status, 301);
    assert.strictEqual(response!.href, 'https://www.example.com/');
  });
  it('should work correctly', async () => {
    const redirect = new RedirectHelper({
      permanent: false,
      source: '/',
      destination: 'https://www.example.com/',
      type: RedirectType.PATH,
    });
    const response = redirect.redirect(new URL('https://demo.example.com'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.example.com/');
  });
  it('should url match work', () => {
    const redirect = new RedirectHelper({
      permanent: false,
      source: 'https://www.example.com/a/b/c',
      destination: 'https://www.example.com/foo/bar',
      type: RedirectType.URL,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.example.com/foo/bar?foo=bar');
  });
  it('should path match work', () => {
    const redirect = new RedirectHelper({
      permanent: false,
      source: '/a/b/c',
      destination: 'https://www.example.com/foo/bar',
      type: RedirectType.PATH,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.example.com/foo/bar?foo=bar');
  });
  it('should path regexp match work', () => {
    let redirect = new RedirectHelper({
      source: '/a/:id/(.*)',
      destination: 'https://www.example.com/new_a/:id/(.*)',
      type: RedirectType.PATH_REGEXP,
    });
    let response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.example.com/new_a/1/b/2');

    redirect = new RedirectHelper({
      source: '/a/:id/b/:id2',
      destination: 'https://www.example.com/new_a/:id2/new_b/:id',
      type: RedirectType.PATH_REGEXP,
    });
    response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response!.href, 'https://www.example.com/new_a/2/new_b/1');

    redirect = new RedirectHelper({
      source: '/a/:id/b/:id2',
      destination: 'https://www.exampleplus.com/:id',
      type: RedirectType.PATH_REGEXP,
    });
    response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response!.href, 'https://www.exampleplus.com/1');
  });

  it('should param match work', () => {
    const redirect = new RedirectHelper({
      source: '/answer/detail?id=:id',
      destination: 'https://ask.oceanbase.com/t/topic/:id',
      type: RedirectType.PATH_REGEXP,
    });
    const response = redirect.redirect(new URL('https://open.oceanbase.com/answer/detail?x=y&id=13700371&a=b'));
    assert.strictEqual(response!.href, 'https://ask.oceanbase.com/t/topic/13700371?x=y&id=13700371&a=b');
  });

  it('should path match failed', () => {
    const redirect = new RedirectHelper({
      source: '/a/:id/b/:id2',
      destination: 'https://www.example.com/new_a/:id3',
      type: RedirectType.PATH_REGEXP,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response, null);
  });

  it('should source host not match', () => {
    const redirect = new RedirectHelper({
      source: 'https://www.exampleplus.com/a/:id/b/:id2',
      destination: 'https://www.example.com/new_a/:id3',
      type: RedirectType.PATH_REGEXP,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response, null);
  });

  it('should source path not match', () => {
    const redirect = new RedirectHelper({
      source: '/a/b/:id',
      destination: 'https://www.example.com/new_a/:id',
      type: RedirectType.PATH_REGEXP,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/1/b/2'));
    assert.strictEqual(response, null);
  });

  it('should paas query in url match work', () => {
    const redirect = new RedirectHelper({
      permanent: false,
      source: 'https://www.example.com/a/b/c',
      destination: 'https://www.example.com/foo/bar?a=1&foo=baz',
      type: RedirectType.URL,
      passQuery: true,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.example.com/foo/bar?a=1&foo=baz&foo=bar');
  });

  it('should paas query in path match ', () => {
    const redirect = new RedirectHelper({
      permanent: false,
      source: '/a/b/c',
      destination: 'https://www.exampleplus.com/foo/bar?a=1&foo=baz',
      type: RedirectType.PATH,
      passQuery: true,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.exampleplus.com/foo/bar?a=1&foo=baz&foo=bar');
  });

  it('should paas query in path match ', () => {
    const redirect = new RedirectHelper({
      source: '/answer/detail?id=:id',
      destination: 'https://ask.oceanbase.com/t/topic/:id',
      type: RedirectType.PATH_REGEXP,
      passQuery: true,
    });
    const response = redirect.redirect(new URL('https://open.oceanbase.com/answer/detail?x=y&id=13700371&a=b'));
    assert.strictEqual(response!.href, 'https://ask.oceanbase.com/t/topic/13700371?x=y&id=13700371&a=b');
  });

  it('should failed when dest is not a valid url', () => {
    let redirect = new RedirectHelper({
      permanent: false,
      source: 'https://www.example.com/a/b/c',
      destination: '/foo/bar',
      type: RedirectType.URL,
    });
    let response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));

    assert.strictEqual(response, null);

    redirect = new RedirectHelper({
      permanent: false,
      source: '/a/b/c',
      destination: '/foo/bar',
      type: RedirectType.PATH,
    });
    response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));
    assert.strictEqual(response, null);

    redirect = new RedirectHelper({
      permanent: false,
      source: '/a/:id1/:id2',
      destination: '/b/:id1/:id2',
      type: RedirectType.PATH_REGEXP,
    });
    response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar'));

    assert.strictEqual(response, null);
  });

  it('should not pass query work', () => {
    const redirect = new RedirectHelper({
      source: '/a/b/c',
      destination: 'https://www.exampleplus.com/?a=1&foo=xxhh',
      type: RedirectType.PATH,
      passQuery: false,
    });
    const response = redirect.redirect(new URL('https://www.example.com/a/b/c?foo=bar&foo=baz'));
    assert.strictEqual(response!.status, 302);
    assert.strictEqual(response!.href, 'https://www.exampleplus.com/?a=1&foo=xxhh');
  });

  it('should work with path regexp redirect', function () {
    const assertRedirect = (rule: RedirectData, url: string, isRedirect: boolean, destination?: string) => {
      const redirect = new RedirectHelper(rule);
      const response = redirect.redirect(new URL(url));
      assert.equal(response?.status === 302, isRedirect);
      assert.equal(response?.href, destination);
    };

    // 前缀模式
    let rule: RedirectData = {
      type: RedirectType.PATH_REGEXP,
      source: '/a/b/(.*)',
      destination: 'https://to.example.com',
    };
    assertRedirect(rule, 'https://www.example.com/a/b', false);
    assertRedirect(rule, 'https://www.example.com/a/b/', true, 'https://to.example.com/');
    assertRedirect(rule, 'https://www.example.com/a/b/c', true, 'https://to.example.com/');
    assertRedirect(rule, 'https://www.example.com/a/b/c?foo=bar', true, 'https://to.example.com/?foo=bar');

    // 特定 path 精准匹配
    rule = {
      type: RedirectType.PATH_REGEXP,
      source: '/a/b',
      destination: 'https://to.example.com/c',
    };
    assertRedirect(rule, 'https://www.example.com/a/b', true, 'https://to.example.com/c');
    assertRedirect(rule, 'https://www.example.com/a/b/', true, 'https://to.example.com/c');
    assertRedirect(rule, 'https://www.example.com/a/b?foo=bar', true, 'https://to.example.com/c?foo=bar');
    assertRedirect(rule, 'https://www.example.com/a/b/c', false);

    // 特定 path 规则末尾配了反斜杠
    rule = {
      type: RedirectType.PATH_REGEXP,
      source: '/a/b/',
      destination: 'https://to.example.com',
    };
    assertRedirect(rule, 'https://www.example.com/a/b', false);
    assertRedirect(rule, 'https://www.example.com/a/b/', true, 'https://to.example.com/');
    assertRedirect(rule, 'https://www.example.com/a/b/c', false);

    // 特定域名 + path
    rule = {
      type: RedirectType.PATH_REGEXP,
      source: 'https://www.example.com/a/b',
      destination: 'https://to.example.com',
    };
    assertRedirect(rule, 'https://www.example.com/a/b', true, 'https://to.example.com/');
    assertRedirect(rule, 'https://www.example.com/a/b?foo=bar', true, 'https://to.example.com/?foo=bar');
    assertRedirect(rule, 'https://a.example.com/a/b', false);

    // 提取变量
    rule = {
      type: RedirectType.PATH_REGEXP,
      source: 'https://www.example.com/:yuyanId/sprint/:sprintId',
      destination: 'https://to.example.com/pages/:yuyanId/:sprintId',
    };
    assertRedirect(rule, 'https://www.example.com/18001/sprint/S001', true, 'https://to.example.com/pages/18001/S001');
    assertRedirect(
      rule,
      'https://www.example.com/18001/sprint/S001?foo=bar',
      true,
      'https://to.example.com/pages/18001/S001?foo=bar',
    );

    // 提取变量 + 通配符
    rule = {
      type: RedirectType.PATH_REGEXP,
      source: 'https://www.example.com/(.*)/:sprintId',
      destination: 'https://to.example.com/pages/(.*)/:sprintId',
    };
    assertRedirect(
      rule,
      'https://www.example.com/18001/sprint/S001',
      true,
      'https://to.example.com/pages/18001/sprint/S001',
    );
    assertRedirect(
      rule,
      'https://www.example.com/18001/sprint/S001?foo=bar',
      true,
      'https://to.example.com/pages/18001/sprint/S001?foo=bar',
    );
  });
});
