// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { defineConfig } from 'vitest/config';

process.env.NODE_OPTIONS = '--no-experimental-fetch';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/globals.ts'],
    environment: 'miniflare',
    // Configuration is automatically loaded from `.env`, `package.json` and
    // `wrangler.toml` files by default, but you can pass any additional Miniflare
    // API options here:
    environmentOptions: {},
    include: ['./test/**/*.test.ts'],
    exclude: ['./test/executor/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json', 'json-summary', 'lcov'],
    },
  },
});
