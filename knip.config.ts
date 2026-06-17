import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: [
    'apps/docs/src/content/docs/plugins/**',
    'apps/docs/src/content/docs/presets/**',
    'apps/docs/src/content/docs/reference/documentation-registry.md',
    'apps/docs/src/content/docs/reference/plugins-catalog.md',
    'apps/docs/sidebar.generated.mjs',
    'apps/docs/doc-registry.json',
  ],
  workspaces: {
    '.': {
      entry: ['code-pushup.config.ts', 'vitest.config.ts', 'eslint.config.js', 'scripts/**/*.mjs'],
      project: [
        '*.{js,ts}',
        'apps/docs/src/content/docs/guides/**/*.md',
        'apps/docs/src/content/docs/project/**/*.md',
        'apps/docs/src/content/docs/reference/audit-contracts.md',
        'apps/docs/src/content/docs/reference/domains.md',
        'apps/docs/src/content/docs/reference/scoring-model.md',
      ],
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
