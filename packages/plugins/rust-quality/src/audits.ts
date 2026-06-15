import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'clippy-warnings', title: 'Clippy warnings' },
  { slug: 'format-check', title: 'Rustfmt format check' },
  { slug: 'advisory-vulnerabilities', title: 'Cargo advisory vulnerabilities' },
  { slug: 'coverage', title: 'Test coverage' },
];
