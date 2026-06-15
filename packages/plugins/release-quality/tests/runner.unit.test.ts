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

describe('release-quality', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'release-quality-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('fails when publish uses NPM_TOKEN', async () => {
    const wf = join(dir, '.github', 'workflows');
    await mkdir(wf, { recursive: true });
    await writeFile(
      join(wf, 'publish.yml'),
      'permissions:\n  id-token: write\nenv:\n  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}\n',
    );

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'npm-oidc-publish')?.score).toBe(0);
  });

  it('detects OIDC publish and separated workflows', async () => {
    const wf = join(dir, '.github', 'workflows');
    await mkdir(wf, { recursive: true });
    await writeFile(
      join(wf, 'publish.yml'),
      'permissions:\n  id-token: write\nenvironment: release\n',
    );
    await writeFile(join(wf, 'release.yml'), 'environment: release\n');
    await writeFile(join(wf, 'pr-commitlint.yml'), 'name: PR Commitlint\n');
    await writeFile(join(dir, 'SECURITY.md'), '# Security\n');

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'npm-oidc-publish')?.score).toBe(1);
    expect(outputs.find((o) => o.slug === 'separated-release-publish')?.score).toBe(1);
  });
});
