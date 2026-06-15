import { describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('llm-review', () => {
  it('gracefully skips when LLM not configured', async () => {
    const prev = process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_MODEL;

    const outputs = await createRunner({ rootDir: '.', sourceDir: 'src' })(runnerArgs);
    expect(outputs.every((o) => o.displayValue?.includes('skipped'))).toBe(true);

    if (prev) process.env.PUSHUP_LLM_ENDPOINT = prev;
  });
});
