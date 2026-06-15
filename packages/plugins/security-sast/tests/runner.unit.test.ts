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

describe('security-sast runner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'security-sast-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('detects gitleaks config', async () => {
    await writeFile(join(dir, '.gitleaks.toml'), '[extend]\n');
    await writeFile(join(dir, 'package.json'), '{"name":"demo"}');

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const secrets = outputs.find((o) => o.slug === 'secrets-detected');
    expect(secrets?.score).toBe(1);
  });

  it('reports missing secrets scanning', async () => {
    await writeFile(join(dir, 'package.json'), '{"name":"demo"}');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const secrets = outputs.find((o) => o.slug === 'secrets-detected');
    expect(secrets?.score).toBe(0);
  });
});
