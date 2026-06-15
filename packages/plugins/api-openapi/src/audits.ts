import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'has-openapi-spec', title: 'OpenAPI spec file present' },
  { slug: 'spectral-violations', title: 'Spectral lint passes' },
  { slug: 'api-versioning', title: 'API versioning in spec' },
  { slug: 'schema-first', title: 'Schema-first API design' },
];
