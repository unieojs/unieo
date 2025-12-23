import { assert, describe, it } from 'vitest';
import { getSanitizedPath } from '../../src/util/Url';

describe('test/util/Url.test.ts', () => {
  describe('getSanitizedPath', () => {
    it('should sanitize path with leading tab character', () => {
      const result = getSanitizedPath('/\t/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should sanitize path with leading newline character', () => {
      const result = getSanitizedPath('/\n/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should sanitize path with leading carriage return character', () => {
      const result = getSanitizedPath('/\r/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should sanitize path with multiple leading special characters', () => {
      const result = getSanitizedPath('/\n/\t/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should sanitize path with combination of all special characters', () => {
      const result = getSanitizedPath('/\n/\r/\t/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should sanitize path with multiple consecutive slashes and special characters', () => {
      const result = getSanitizedPath('///\n\t\r/evil.com');
      assert.strictEqual(result, '/evil.com');
    });

    it('should preserve already sanitized paths', () => {
      const result = getSanitizedPath('/normal/path');
      assert.strictEqual(result, '/normal/path');
    });

    it('should handle root path', () => {
      const result = getSanitizedPath('/');
      assert.strictEqual(result, '/');
    });

    it('should handle empty string', () => {
      const result = getSanitizedPath('');
      assert.strictEqual(result, '');
    });

    it('should handle path with only special characters', () => {
      const result = getSanitizedPath('/\n\t\r');
      assert.strictEqual(result, '/');
    });

    it('should preserve special characters in the middle of path', () => {
      const result = getSanitizedPath('/path/with\nnewline/inside');
      assert.strictEqual(result, '/path/with\nnewline/inside');
    });

    it('should handle path with query string', () => {
      const result = getSanitizedPath('/\n/evil.com?foo=bar');
      assert.strictEqual(result, '/evil.com?foo=bar');
    });

    it('should handle path with fragment', () => {
      const result = getSanitizedPath('/\t/evil.com#section');
      assert.strictEqual(result, '/evil.com#section');
    });

    it('should handle complex open redirect attack vectors', () => {
      // Test case from RedirectHelper security fix
      const result1 = getSanitizedPath('/\t/evil.com');
      assert.strictEqual(result1, '/evil.com');
      
      const result2 = getSanitizedPath('/\n/\t/evil.com');
      assert.strictEqual(result2, '/evil.com');
      
      const result3 = getSanitizedPath('/\n/\r/evil.com');
      assert.strictEqual(result3, '/evil.com');
    });
  });
});
