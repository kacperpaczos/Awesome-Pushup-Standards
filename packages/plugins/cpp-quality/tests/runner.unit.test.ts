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
  it('skipped audit has score 1', () => {
    const out = skippedAudit('clang-tidy-warnings', 'clang-tidy');
    expect(out.score).toBe(1);
    expect(out.displayValue).toContain('skipped');
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
