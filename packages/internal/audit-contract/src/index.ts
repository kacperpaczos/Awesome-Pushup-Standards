import type { AuditOutput } from '@code-pushup/models';

export type AuditRigor = 'base' | 'strict';

export const DEFAULT_AUDIT_RIGOR: AuditRigor = 'strict';

/** Category weight: tool-dependent audits weigh 0 in base rigor. */
export function presetWeight(
  strictWeight: number,
  rigor: AuditRigor,
  toolDependent = false,
): number {
  if (rigor === 'base' && toolDependent) return 0;
  return strictWeight;
}

/** Missing external CLI — score depends on rigor (see audit-contracts RFC). */
export function toolMissingAudit(
  slug: string,
  tool: string,
  rigor: AuditRigor = DEFAULT_AUDIT_RIGOR,
): AuditOutput {
  if (rigor === 'base') {
    return {
      slug,
      value: 0,
      score: 1,
      displayValue: `${tool} not installed — skipped`,
    };
  }
  return {
    slug,
    value: 0,
    score: 0,
    displayValue: `${tool} not installed`,
  };
}
