import { describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';
import { skippedAudit } from '../src/lib/run-tool.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('rust-quality', () => {
  it('returns score 0 when tool not installed (strict rigor default)', () => {
    const out = skippedAudit('clippy-warnings', 'cargo clippy');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('cargo clippy not installed');
  });

  it('returns score 1 skip when tool not installed in base rigor', () => {
    const out = skippedAudit('clippy-warnings', 'cargo clippy', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('cargo clippy not installed — skipped');
  });

  it('returns four rust quality audits', async () => {
    const outputs = await createRunner({ cwd: '.' })(runnerArgs);
    expect(outputs).toHaveLength(4);
    expect(outputs.map((o) => o.slug)).toEqual([
      'clippy-warnings',
      'format-check',
      'advisory-vulnerabilities',
      'coverage',
    ]);
  });
});
