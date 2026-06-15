import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'clazy-warnings', title: 'Clazy Qt warnings' },
  { slug: 'qt-api-misuse', title: 'Qt API misuse checks' },
];
