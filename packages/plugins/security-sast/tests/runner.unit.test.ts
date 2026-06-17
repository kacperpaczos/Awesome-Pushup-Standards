import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { toolMissingAudit } from '@awesome-pushup-standards/audit-contract';
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

  it('detects SAST tooling in pyproject.toml', async () => {
    await writeFile(join(dir, '.gitleaks.toml'), '[extend]\n');
    await writeFile(join(dir, 'package.json'), '{"name":"demo"}');
    await writeFile(join(dir, 'pyproject.toml'), '[tool.bandit]\nskips = []\n');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const sast = outputs.find((o) => o.slug === 'sast-findings');
    expect(sast?.score).toBe(1);
  });

  it('reports missing SAST tooling when no config present', async () => {
    await writeFile(join(dir, 'package.json'), '{"name":"demo","dependencies":{}}');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const sast = outputs.find((o) => o.slug === 'sast-findings');
    expect(sast?.score).toBe(0);
  });

  it('skips missing pip-audit in base rigor', () => {
    const out = toolMissingAudit('dependency-audit', 'pip-audit', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('pip-audit not installed — skipped');
  });

  it('fails missing pip-audit in strict rigor', () => {
    const out = toolMissingAudit('dependency-audit', 'pip-audit', 'strict');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('pip-audit not installed');
  });
});
