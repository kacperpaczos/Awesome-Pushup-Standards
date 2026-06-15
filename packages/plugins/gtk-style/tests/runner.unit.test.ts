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

describe('gtk-style runner', () => {
  it('scores 1 for compliant GObject sources', async () => {
    const runner = createRunner({ rootDir: join(fixtures, 'good'), sourceDir: 'src/' });
    const outputs = await runner(runnerArgs);

    expect(outputs).toHaveLength(3);
    expect(outputs[0]?.score).toBe(1);
    expect(outputs[2]?.score).toBe(1);
  });

  it('flags missing GObject macros', async () => {
    const runner = createRunner({ rootDir: join(fixtures, 'bad-style'), sourceDir: 'src/' });
    const outputs = await runner(runnerArgs);

    expect(outputs[0]?.slug).toBe('gobject-macros');
    expect(outputs[0]?.score).toBe(0);
  });

  it('flags trailing whitespace', async () => {
    const runner = createRunner({ rootDir: join(fixtures, 'bad-style'), sourceDir: 'src/' });
    const outputs = await runner(runnerArgs);

    expect(outputs[2]?.slug).toBe('style-consistency');
    expect(outputs[2]?.score).toBe(0);
  });
});
