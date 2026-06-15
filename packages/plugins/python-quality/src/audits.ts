import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'ruff-lint', title: 'Ruff lint' },
  { slug: 'type-errors', title: 'Type checker errors' },
  { slug: 'line-coverage', title: 'Line coverage' },
  { slug: 'bandit-findings', title: 'Bandit security findings' },
  { slug: 'dependency-vulnerabilities', title: 'Dependency vulnerabilities' },
];
