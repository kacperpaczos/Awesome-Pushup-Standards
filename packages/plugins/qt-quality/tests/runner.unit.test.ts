import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { skippedAudit } from '../src/lib/run-tool.js';
import { createRunner } from '../src/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = join(__dirname, 'fixtures');

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('qt-quality', () => {
  it('returns score 0 when tool not installed (strict rigor default)', () => {
    const out = skippedAudit('clazy-warnings', 'clazy');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('clazy not installed');
  });

  it('returns score 1 skip when tool not installed in base rigor', () => {
    const out = skippedAudit('clazy-warnings', 'clazy', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('clazy not installed — skipped');
  });

  it('scores Qt project with clazy and clang-tidy checks', async () => {
    const runner = createRunner({ rootDir: join(fixtures, 'complete-qt') });
    const outputs = await runner(runnerArgs);

    expect(outputs).toHaveLength(2);
    expect(outputs.every((o) => o.score === 1)).toBe(true);
    expect(outputs[0]?.displayValue).toContain('clazy');
    expect(outputs[1]?.displayValue).toContain('clang-tidy');
  });

  it('flags missing Qt clang-tidy checks', async () => {
    const runner = createRunner({ rootDir: join(fixtures, 'minimal-qt') });
    const outputs = await runner(runnerArgs);

    expect(outputs[1]?.slug).toBe('qt-api-misuse');
    expect(outputs[1]?.score).toBe(0);
  });
});
