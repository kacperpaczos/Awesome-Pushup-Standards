import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'has-pydantic', title: 'Uses pydantic for validation' },
  { slug: 'has-type-checker', title: 'Has mypy/ty configured' },
  { slug: 'has-ruff', title: 'Has ruff configured' },
  { slug: 'has-security-tooling', title: 'Has bandit/pip-audit' },
];
