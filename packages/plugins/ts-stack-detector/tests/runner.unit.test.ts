import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
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

describe('ts-stack-detector runner', () => {
  it('scores 1 when TS, ESLint, and Zod are present', async () => {
    const outputs = await createRunner({
      packageJsonPath: join(fixtures, 'with-typescript.json'),
      scanSource: false,
    })(runnerArgs);

    expect(outputs.every((o) => o.score === 1)).toBe(true);
  });

  it('suggests TypeScript when missing', async () => {
    const outputs = await createRunner({
      packageJsonPath: join(fixtures, 'without-typescript.json'),
      scanSource: false,
    })(runnerArgs);

    const ts = outputs.find((o) => o.slug === 'suggest-typescript');
    expect(ts?.score).toBe(0);
  });
});
