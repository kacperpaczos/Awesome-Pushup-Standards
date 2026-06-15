import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'architecture-review', title: 'Architecture and layering' },
  { slug: 'naming-review', title: 'Naming quality' },
  { slug: 'consistency-review', title: 'Code consistency' },
  { slug: 'modern-alternatives', title: 'Modern alternatives' },
  { slug: 'readability-review', title: 'Readability' },
];
