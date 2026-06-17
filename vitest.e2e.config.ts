import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  root: rootDir,
  resolve: {
    alias: {
      '@awesome-pushup/e2e-utils': resolve(rootDir, 'testing/e2e-utils/src/index.ts'),
    },
  },
  test: {
    include: ['e2e/**/tests/*.e2e.test.ts'],
    environment: 'node',
    fileParallelism: false,
    maxWorkers: 1,
    globalSetup: ['./testing/e2e-utils/src/vitest-e2e-global-setup.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
