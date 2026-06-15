import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRunner } from '../src/runner.js';

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

describe('docs-quality runner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'docs-quality-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores high when docs are complete', async () => {
    await writeFile(join(dir, 'README.md'), '# Demo\n\n## Install\n\n## Usage\n');
    await writeFile(join(dir, 'CHANGELOG.md'), '# Changelog\n');
    await writeFile(join(dir, 'LICENSE'), 'MIT');
    await writeFile(join(dir, 'CONTRIBUTING.md'), '# Contributing\n');

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.every((o) => o.score === 1)).toBe(true);
  });

  it('scores low when docs are missing', async () => {
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.every((o) => o.score === 0)).toBe(true);
  });
});
