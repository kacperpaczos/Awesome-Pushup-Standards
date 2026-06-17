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
  it('skipped audit has score 1', () => {
    const out = skippedAudit('clippy-warnings', 'cargo clippy');
    expect(out.score).toBe(1);
    expect(out.displayValue).toContain('skipped');
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
