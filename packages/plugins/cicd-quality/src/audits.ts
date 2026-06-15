import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'ci-present', title: 'GitHub Actions workflows present' },
  { slug: 'actions-pinned', title: 'Actions pinned to commit SHA' },
  { slug: 'dependency-scanning-in-ci', title: 'Dependency scanning in CI' },
  { slug: 'fork-safe-workflows', title: 'Fork-safe workflow separation' },
  { slug: 'minimal-permissions', title: 'Minimal workflow permissions' },
  { slug: 'release-concurrency', title: 'Release concurrency guards' },
  { slug: 'multi-os-ci', title: 'Multi-OS CI matrix' },
  { slug: 'nx-affected-ci', title: 'Nx affected in CI' },
  { slug: 'dependency-review-workflow', title: 'Dependency review workflow' },
];
