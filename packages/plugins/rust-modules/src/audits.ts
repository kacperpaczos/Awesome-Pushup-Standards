import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'module-cycles', title: 'Module dependency cycles' },
  { slug: 'banned-dependencies', title: 'Banned dependencies' },
];
