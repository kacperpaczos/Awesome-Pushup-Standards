import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'hadolint-violations', title: 'Hadolint Dockerfile violations' },
  { slug: 'multi-stage-build', title: 'Multi-stage Docker build' },
  { slug: 'image-size', title: 'Image size budget' },
  { slug: 'image-vulnerabilities', title: 'Image vulnerability scanning in CI' },
];
