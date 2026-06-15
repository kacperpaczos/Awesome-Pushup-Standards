import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'secrets-detected', title: 'Secrets scanning configured' },
  { slug: 'dependency-audit', title: 'Dependency vulnerabilities' },
  { slug: 'sast-findings', title: 'SAST tooling present' },
  { slug: 'sbom-generated', title: 'SBOM generation configured' },
];
