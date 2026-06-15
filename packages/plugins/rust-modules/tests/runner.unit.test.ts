import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
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

describe('rust-modules', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'rust-modules-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('detects deny.toml', async () => {
    await writeFile(join(dir, 'Cargo.toml'), '[package]\nname = "demo"\n');
    await writeFile(join(dir, 'deny.toml'), '[advisories]\n');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const banned = outputs.find((o) => o.slug === 'banned-dependencies');
    expect(banned?.score).toBe(1);
  });
});
