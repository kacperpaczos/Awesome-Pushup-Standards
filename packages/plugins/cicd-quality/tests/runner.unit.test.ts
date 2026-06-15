import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
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

describe('cicd-quality extended', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'cicd-quality-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores low when CI infrastructure is missing', async () => {
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'ci-present')?.score).toBe(0);
    expect(outputs.find((o) => o.slug === 'nx-affected-ci')?.score).toBe(0);
  });

  it('detects nx affected and fork workflow', async () => {
    const wf = join(dir, '.github', 'workflows');
    await mkdir(wf, { recursive: true });
    await writeFile(
      join(wf, 'ci.yml'),
      `permissions:\n  contents: read\njobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, windows-latest, macos-latest]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: nrwl/nx-set-shas@v4\n      - run: npx nx affected -t test\n`,
    );
    await writeFile(
      join(wf, 'code-pushup-fork.yml'),
      'on:\n  pull_request_target:\n# fork PRs no secrets\n',
    );
    await writeFile(join(wf, 'dependency-review.yml'), 'uses: dependency-review-action@v4\n');
    await writeFile(
      join(wf, 'release.yml'),
      'concurrency:\n  cancel-in-progress: false\npermissions:\n  contents: write\n',
    );

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'nx-affected-ci')?.score).toBe(1);
    expect(outputs.find((o) => o.slug === 'fork-safe-workflows')?.score).toBe(1);
    expect(outputs.find((o) => o.slug === 'multi-os-ci')?.score).toBe(1);
  });
});
