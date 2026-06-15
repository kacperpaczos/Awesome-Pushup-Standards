import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'forbidden-imports', title: 'Forbidden import rules configured' },
  { slug: 'circular-dependencies', title: 'Circular dependency rules configured' },
  { slug: 'layer-violations', title: 'Layer/architecture rules configured' },
  { slug: 'god-module', title: 'No god modules (import threshold)' },
];
