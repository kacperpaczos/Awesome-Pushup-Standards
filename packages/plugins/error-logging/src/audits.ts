import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'bare-except', title: 'No bare except in Python' },
  { slug: 'structured-logging', title: 'Structured logging configured' },
  { slug: 'no-print-debug', title: 'No console.log in src/' },
];
