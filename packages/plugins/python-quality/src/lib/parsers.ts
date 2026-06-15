import type { AuditOutput, Issue } from '@code-pushup/models';
import type { ToolResult } from './run-tool.js';

function skipped(slug: string, tool: string): AuditOutput {
  return {
    slug,
    value: 0,
    score: 1,
    displayValue: `${tool} not found — skipped`,
    details: {
      issues: [
        {
          message: `${tool} is not installed — audit skipped`,
          severity: 'info',
        },
      ],
    },
  };
}

export function parseRuff(result: ToolResult): AuditOutput {
  if (result.status === 'skipped') return skipped('ruff-lint', 'ruff');

  const output = result.stdout ?? (result.status === 'error' ? result.stdout : '');
  if (!output) {
    const ok = result.status === 'ok';
    return {
      slug: 'ruff-lint',
      value: ok ? 0 : 1,
      score: ok ? 1 : 0,
      displayValue: ok ? 'no issues' : 'lint errors',
    };
  }

  try {
    const data = JSON.parse(output) as unknown[];
    const count = Array.isArray(data) ? data.length : 0;
    return {
      slug: 'ruff-lint',
      value: count,
      score: count === 0 ? 1 : 0,
      displayValue: count === 0 ? 'no issues' : `${count} issues`,
      details:
        count > 0
          ? {
              issues: (
                data as { message?: string; filename?: string; location?: { row?: number } }[]
              )
                .slice(0, 20)
                .map(
                  (item): Issue => ({
                    message: item.message ?? 'ruff issue',
                    severity: 'warning',
                    source: item.filename
                      ? {
                          file: item.filename,
                          position: { startLine: item.location?.row ?? 1 },
                        }
                      : undefined,
                  }),
                ),
            }
          : undefined,
    };
  } catch {
    return {
      slug: 'ruff-lint',
      value: 1,
      score: 0,
      displayValue: 'lint errors',
    };
  }
}

export function parseMypy(result: ToolResult): AuditOutput {
  if (result.status === 'skipped') return skipped('type-errors', 'mypy');

  const ok = result.status === 'ok';
  return {
    slug: 'type-errors',
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? 'no type errors' : 'type errors found',
  };
}

export function parseCoverage(result: ToolResult): AuditOutput {
  if (result.status === 'skipped') return skipped('line-coverage', 'pytest');

  const output = result.stdout ?? '';
  try {
    const data = JSON.parse(output) as { totals?: { percent_covered?: number } };
    const pct = data.totals?.percent_covered ?? 0;
    const score = Math.min(1, Math.max(0, pct / 100));
    return {
      slug: 'line-coverage',
      value: pct,
      score,
      displayValue: `${pct.toFixed(1)}%`,
    };
  } catch {
    return {
      slug: 'line-coverage',
      value: 0,
      score: 0,
      displayValue: 'coverage unavailable',
    };
  }
}

export function parseBandit(result: ToolResult): AuditOutput {
  if (result.status === 'skipped') return skipped('bandit-findings', 'bandit');

  const output = result.stdout ?? (result.status === 'error' ? result.stdout : '');
  try {
    const data = JSON.parse(output ?? '{}') as { results?: unknown[] };
    const count = data.results?.length ?? 0;
    return {
      slug: 'bandit-findings',
      value: count,
      score: count === 0 ? 1 : 0,
      displayValue: count === 0 ? 'no findings' : `${count} findings`,
    };
  } catch {
    const ok = result.status === 'ok';
    return {
      slug: 'bandit-findings',
      value: ok ? 0 : 1,
      score: ok ? 1 : 0,
      displayValue: ok ? 'no findings' : 'findings detected',
    };
  }
}

export function parsePipAudit(result: ToolResult): AuditOutput {
  if (result.status === 'skipped') return skipped('dependency-vulnerabilities', 'pip-audit');

  const ok = result.status === 'ok';
  return {
    slug: 'dependency-vulnerabilities',
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? 'no vulnerabilities' : 'vulnerabilities found',
  };
}
