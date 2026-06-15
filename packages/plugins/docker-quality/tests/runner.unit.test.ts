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
  it('skipped audit has score 1', () => {
    const out = skippedAudit('hadolint-violations', 'hadolint');
    expect(out.score).toBe(1);
    expect(out.displayValue).toContain('skipped');
  });

  it('skips when no Dockerfile is present', async () => {
    const runner = createRunner({ rootDir: '.' });
    const outputs = await runner(runnerArgs);

    expect(outputs[0]?.displayValue).toContain('skipped');
    expect(outputs[0]?.score).toBe(1);
  });
});
