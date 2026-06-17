import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { DEFAULT_AUDIT_RIGOR, type AuditRigor } from '@awesome-pushup-standards/audit-contract';
import { runTool, skippedAudit } from './lib/run-tool.js';

export type RunnerOptions = { cwd?: string; rigor?: AuditRigor };

export function createRunner(options: RunnerOptions = {}) {
  const cwd = options.cwd ?? '.';
  const rigor = options.rigor ?? DEFAULT_AUDIT_RIGOR;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const [clippy, fmt, audit, tarpaulin] = await Promise.all([
      runTool('cargo', ['clippy', '--', '-D', 'warnings'], cwd),
      runTool('cargo', ['fmt', '--', '--check'], cwd),
      runTool('cargo', ['audit'], cwd),
      runTool('cargo', ['tarpaulin', '--out', 'Json'], cwd),
    ]);

    const clippyOut: AuditOutput =
      clippy.status === 'skipped'
        ? skippedAudit('clippy-warnings', 'cargo clippy', rigor)
        : {
            slug: 'clippy-warnings',
            value: clippy.status === 'ok' ? 0 : 1,
            score: clippy.status === 'ok' ? 1 : 0,
            displayValue: clippy.status === 'ok' ? 'no warnings' : 'clippy warnings',
          };

    const fmtOut: AuditOutput =
      fmt.status === 'skipped'
        ? skippedAudit('format-check', 'rustfmt', rigor)
        : {
            slug: 'format-check',
            value: fmt.status === 'ok' ? 0 : 1,
            score: fmt.status === 'ok' ? 1 : 0,
            displayValue: fmt.status === 'ok' ? 'formatted' : 'format violations',
          };

    const auditOut: AuditOutput =
      audit.status === 'skipped'
        ? skippedAudit('advisory-vulnerabilities', 'cargo audit', rigor)
        : {
            slug: 'advisory-vulnerabilities',
            value: audit.status === 'ok' ? 0 : 1,
            score: audit.status === 'ok' ? 1 : 0,
            displayValue: audit.status === 'ok' ? 'no advisories' : 'advisories found',
          };

    let coverageOut: AuditOutput;
    if (tarpaulin.status === 'skipped') {
      coverageOut = skippedAudit('coverage', 'cargo tarpaulin', rigor);
    } else {
      const match = tarpaulin.stdout?.match(/(\d+(?:\.\d+)?)%/);
      const pct = match ? parseFloat(match[1]) : 0;
      coverageOut = {
        slug: 'coverage',
        value: pct,
        score: Math.min(1, pct / 100),
        displayValue: `${pct.toFixed(1)}%`,
      };
    }

    return [clippyOut, fmtOut, auditOut, coverageOut];
  };
}
