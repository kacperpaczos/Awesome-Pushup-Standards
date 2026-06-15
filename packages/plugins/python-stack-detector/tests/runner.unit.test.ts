import { readFile } from 'node:fs/promises';
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

describe('python-stack-detector runner', () => {
  it('scores 1 when stack tooling is present', async () => {
    const runner = createRunner({
      pyprojectPath: join(fixtures, 'complete-pyproject.toml'),
    });
    const outputs = await runner(runnerArgs);

    expect(outputs).toHaveLength(4);
    expect(outputs.every((o) => o.score === 1)).toBe(true);
  });

  it('scores 0 when stack tooling is missing', async () => {
    const runner = createRunner({
      pyprojectPath: join(fixtures, 'minimal-pyproject.toml'),
    });
    const outputs = await runner(runnerArgs);

    expect(outputs.every((o) => o.score === 0)).toBe(true);
    expect(outputs[0]?.displayValue).toContain('missing');
  });

  it('handles missing pyproject file', async () => {
    const runner = createRunner({ pyprojectPath: join(fixtures, 'missing.toml') });
    const outputs = await runner(runnerArgs);

    expect(outputs.every((o) => o.score === 0)).toBe(true);
  });

  it('fixture complete file contains pydantic', async () => {
    const content = await readFile(join(fixtures, 'complete-pyproject.toml'), 'utf8');
    expect(content).toContain('pydantic');
  });
});
