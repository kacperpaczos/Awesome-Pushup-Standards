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

describe('docker-quality', () => {
  it('returns score 0 when tool not installed (strict rigor default)', () => {
    const out = skippedAudit('hadolint-violations', 'hadolint');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('hadolint not installed');
  });

  it('returns score 1 skip when tool not installed in base rigor', () => {
    const out = skippedAudit('hadolint-violations', 'hadolint', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('hadolint not installed — skipped');
  });

  it('skips when no Dockerfile is present', async () => {
    const runner = createRunner({ rootDir: '.' });
    const outputs = await runner(runnerArgs);

    expect(outputs[0]?.displayValue).toContain('skipped');
    expect(outputs[0]?.score).toBe(1);
  });
});
