import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { toolMissingAudit } from '@awesome-pushup-standards/audit-contract';
import { createRunner } from '../src/runner.js';

const execFileAsync = promisify(execFile);

const runnerArgs = {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'] as const,
    skipReports: false,
  },
};

async function hasCargoModules(): Promise<boolean> {
  try {
    await execFileAsync('cargo', ['modules', '--version']);
    return true;
  } catch {
    return false;
  }
}

async function hasCargoDeny(): Promise<boolean> {
  try {
    await execFileAsync('cargo-deny', ['--version']);
    return true;
  } catch {
    try {
      await execFileAsync('cargo', ['deny', '--version']);
      return true;
    } catch {
      return false;
    }
  }
}

async function writeAcyclicProject(dir: string): Promise<void> {
  await writeFile(
    join(dir, 'Cargo.toml'),
    '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\nlicense = "MIT"\n\n[dependencies]\nserde = "1"\n',
  );
  await writeFile(
    join(dir, 'deny.toml'),
    '[advisories]\nignore = []\n\n[licenses]\nallow = ["MIT", "Apache-2.0", "Unicode-3.0"]\nconfidence-threshold = 0.8\n',
  );
  await writeFile(
    join(dir, 'src', 'main.rs'),
    'mod app;\nmod helpers;\n\nfn main() {\n    app::run();\n}\n',
  );
  await writeFile(
    join(dir, 'src', 'app.rs'),
    'use crate::helpers;\n\npub fn run() {\n    helpers::greet();\n}\n',
  );
  await writeFile(join(dir, 'src', 'helpers.rs'), 'pub fn greet() {}\n');
  await execFileAsync('cargo', ['generate-lockfile'], { cwd: dir });
}

describe('rust-modules', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'rust-modules-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('fails banned-dependencies without deny.toml', async () => {
    await writeFile(join(dir, 'Cargo.toml'), '[package]\nname = "demo"\n');
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const banned = outputs.find((o) => o.slug === 'banned-dependencies');
    expect(banned?.score).toBe(0);
  });

  it('fails banned-dependencies with deny.toml but without Cargo.lock', async () => {
    await writeFile(
      join(dir, 'Cargo.toml'),
      '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\nlicense = "MIT"\n',
    );
    await writeFile(
      join(dir, 'deny.toml'),
      '[advisories]\nignore = []\n\n[licenses]\nallow = ["MIT"]\nconfidence-threshold = 0.8\n',
    );
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const banned = outputs.find((o) => o.slug === 'banned-dependencies');
    expect(banned?.score).toBe(0);
    expect(banned?.displayValue).toContain('Cargo.lock');
  });

  it('passes banned-dependencies with deny.toml and Cargo.lock', async () => {
    const denyAvailable = await hasCargoDeny();
    if (!denyAvailable) return;

    await writeAcyclicProject(dir);
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const banned = outputs.find((o) => o.slug === 'banned-dependencies');
    expect(banned?.score).toBe(1);
  });

  it('passes module-cycles for acyclic modules', async () => {
    const modulesAvailable = await hasCargoModules();
    if (!modulesAvailable) return;

    await writeAcyclicProject(dir);
    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const cycles = outputs.find((o) => o.slug === 'module-cycles');
    expect(cycles?.score).toBe(1);
    expect(cycles?.displayValue).toBe('no cycles detected');
  });

  it('skips missing cargo-modules in base rigor', () => {
    const out = toolMissingAudit('module-cycles', 'cargo-modules', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toBe('cargo-modules not installed — skipped');
  });

  it('fails missing cargo-modules in strict rigor', () => {
    const out = toolMissingAudit('module-cycles', 'cargo-modules', 'strict');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('cargo-modules not installed');
  });
});
