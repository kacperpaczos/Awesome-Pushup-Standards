import { describe, expect, it } from 'vitest';
import { skippedAudit } from '../src/lib/run-tool.js';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('cpp-quality', () => {
  it('returns score 0 when tool not installed (strict rigor default)', () => {
    const out = skippedAudit('clang-tidy-warnings', 'clang-tidy');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('clang-tidy not installed');
  });

  it('returns score 1 skip when tool not installed in base rigor', () => {
    const out = skippedAudit('clang-tidy-warnings', 'clang-tidy', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('clang-tidy not installed — skipped');
  });

  it('returns all audit slugs', async () => {
    const runner = createRunner({ cwd: '.' });
    const outputs = await runner(runnerArgs);

    expect(outputs).toHaveLength(3);
    expect(outputs.map((o) => o.slug)).toEqual([
      'clang-tidy-warnings',
      'cppcheck-issues',
      'format-violations',
    ]);
  });
});
