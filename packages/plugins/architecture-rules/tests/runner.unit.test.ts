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

describe('architecture-rules runner', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'architecture-rules-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('scores high when dependency-cruiser with real rules is configured', async () => {
    await writeFile(
      join(dir, '.dependency-cruiser.js'),
      'module.exports = { forbidden: [{ name: "no-cycles", from: {}, to: {} }], options: {} };',
    );

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const bySlug = Object.fromEntries(outputs.map((o) => [o.slug, o]));

    expect(bySlug['forbidden-imports']?.score).toBe(1);
    expect(bySlug['circular-dependencies']?.score).toBe(1);
    expect(bySlug['layer-violations']?.score).toBe(1);
  });

  it('fails layer-violations when dependency-cruiser has empty forbidden array', async () => {
    await writeFile(
      join(dir, '.dependency-cruiser.js'),
      'module.exports = { forbidden: [], options: {} };',
    );

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    const bySlug = Object.fromEntries(outputs.map((o) => [o.slug, o]));

    expect(bySlug['forbidden-imports']?.score).toBe(1);
    expect(bySlug['layer-violations']?.score).toBe(0);
  });

  it('detects god modules above import threshold', async () => {
    const src = join(dir, 'src');
    await mkdir(src, { recursive: true });
    const imports = Array.from({ length: 20 }, (_, i) => `import x${i} from './x${i}';`).join('\n');
    await writeFile(join(src, 'huge.ts'), imports);

    const outputs = await createRunner({ rootDir: dir, godModuleImportThreshold: 15 })(runnerArgs);
    const god = outputs.find((o) => o.slug === 'god-module');

    expect(god?.score).toBe(0);
    expect(god?.displayValue).toContain('god module');
  });

  it('scores import-linter in pyproject as architecture tooling', async () => {
    await writeFile(join(dir, 'pyproject.toml'), '[tool.importlinter]\nroot_package = "app"\n');

    const outputs = await createRunner({ rootDir: dir })(runnerArgs);
    expect(outputs.find((o) => o.slug === 'forbidden-imports')?.score).toBe(1);
  });
});
