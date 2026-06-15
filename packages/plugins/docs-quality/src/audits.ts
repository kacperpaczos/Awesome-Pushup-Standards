import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'readme-completeness', title: 'README completeness' },
  { slug: 'has-changelog', title: 'Has changelog' },
  { slug: 'has-license', title: 'Has license file' },
  { slug: 'has-contributing', title: 'Has contributing guide' },
];
