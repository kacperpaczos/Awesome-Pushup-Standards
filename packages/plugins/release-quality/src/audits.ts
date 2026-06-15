import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'npm-oidc-publish', title: 'npm OIDC trusted publishing' },
  { slug: 'separated-release-publish', title: 'Separated release and publish' },
  { slug: 'security-policy', title: 'SECURITY.md policy' },
  { slug: 'pr-commitlint', title: 'PR commitlint workflow' },
  { slug: 'pkg-preview-on-pr', title: 'Package preview on PR' },
  { slug: 'release-environment', title: 'Release GitHub environment' },
];
