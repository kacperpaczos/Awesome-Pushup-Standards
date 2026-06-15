import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'conventional-commits', title: 'Conventional commits configured' },
  { slug: 'pre-commit-hooks', title: 'Pre-commit hooks' },
  { slug: 'commitizen-configured', title: 'Commitizen configured' },
  { slug: 'editorconfig-present', title: 'EditorConfig present' },
  { slug: 'prettier-configured', title: 'Prettier configured' },
  { slug: 'knip-configured', title: 'Knip dead code detection' },
  { slug: 'env-example-present', title: '.env.example present' },
];
