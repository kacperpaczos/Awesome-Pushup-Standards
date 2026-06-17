import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('error-logging runner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'error-logging-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores high for clean Python and JS logging', async () => {
    await writeFile(
      join(dir, 'app.py'),
      'import logging\nlogger = logging.getLogger(__name__)\ntry:\n    pass\nexcept ValueError:\n    pass\n',
    );
    const src = join(dir, 'src');
    await mkdir(src, { recursive: true });
    await writeFile(join(src, 'index.ts'), 'export const x = 1;\n');
    await writeFile(
      join(dir, 'package.json'),
      JSON.stringify({ dependencies: { pino: '^9.0.0' } }),
    );

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.every((o) => o.score === 1)).toBe(true);
  });

  it('detects bare except and console.log', async () => {
    await writeFile(join(dir, 'bad.py'), 'try:\n    pass\nexcept:\n    pass\n');
    const src = join(dir, 'src');
    await mkdir(src, { recursive: true });
    await writeFile(join(src, 'debug.ts'), "console.log('debug');\n");

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'bare-except')?.score).toBe(0);
    expect(outputs.find((o) => o.slug === 'no-print-debug')?.score).toBe(0);
  });

  it('detects broad except Exception: as bare-except', async () => {
    await writeFile(join(dir, 'broad.py'), 'try:\n    pass\nexcept Exception:\n    pass\n');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'bare-except')?.score).toBe(0);
  });

  it('allows named exception handlers like except ValueError:', async () => {
    await writeFile(join(dir, 'good.py'), 'try:\n    pass\nexcept ValueError:\n    pass\n');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'bare-except')?.score).toBe(1);
  });
});
