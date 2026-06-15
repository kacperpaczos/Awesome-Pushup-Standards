import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));

export default defineConfig({
  root: rootDir,
  test: {
    include: ['packages/**/tests/**/*.test.ts'],
    environment: 'node',
  },
});
