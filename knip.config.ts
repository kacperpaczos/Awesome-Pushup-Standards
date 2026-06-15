import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  workspaces: {
    '.': {
      entry: ['code-pushup.config.ts', 'vitest.config.ts', 'eslint.config.js'],
      project: ['*.{js,ts}', 'docs/**/*.md'],
    },
    'packages/plugins/*': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts', 'tests/**/*.ts'],
    },
    'packages/presets/*': {
      entry: ['src/index.ts'],
      project: ['src/**/*.ts'],
    },
  },
  ignoreDependencies: ['@code-pushup/models', '@code-pushup/utils'],
};

export default config;
