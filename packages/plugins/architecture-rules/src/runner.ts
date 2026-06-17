import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

export type RunnerOptions = {
  rootDir?: string;
  godModuleImportThreshold?: number;
};

function binary(
  slug: string,
  ok: boolean,
  okLabel: string,
  failLabel: string,
  message?: string,
  file?: string,
): AuditOutput {
  return {
    slug,
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? okLabel : failLabel,
    details:
      ok || !message
        ? undefined
        : {
            issues: [
              {
                message,
                severity: 'warning',
                source: file ? { file, position: { startLine: 1 } } : undefined,
              },
            ],
          },
  };
}

function hasDependencyCruiser(root: string): boolean {
  const names = [
    '.dependency-cruiser.js',
    '.dependency-cruiser.cjs',
    'dependency-cruiser.js',
    '.dependency-cruerc.json',
    '.dependency-cruiser.json',
    'dependency-cruiser.json',
  ];
  return names.some((name) => existsSync(join(root, name)));
}

async function readPyproject(root: string): Promise<string> {
  const path = join(root, 'pyproject.toml');
  if (!existsSync(path)) return '';
  return readFile(path, 'utf8');
}

function hasImportLinter(pyproject: string): boolean {
  return /importlinter|\[tool\.importlinter\]/i.test(pyproject);
}

async function hasLayerRules(root: string, pyproject: string): Promise<boolean> {
  if (/layers|layer/i.test(pyproject) && hasImportLinter(pyproject)) return true;

  const cruiserFiles = [
    '.dependency-cruiser.js',
    '.dependency-cruiser.cjs',
    'dependency-cruiser.js',
    '.dependency-cruerc.json',
    '.dependency-cruiser.json',
    'dependency-cruiser.json',
  ];

  for (const name of cruiserFiles) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    const content = await readFile(path, 'utf8');
    if (/forbidden\s*:\s*\[[^\]]*\{/.test(content)) return true;
  }

  return false;
}

async function findGodModules(
  root: string,
  threshold: number,
): Promise<{ file: string; count: number }[]> {
  const srcDir = join(root, 'src');
  if (!existsSync(srcDir)) return [];

  const files = await crawlFileSystem({
    directory: srcDir,
    pattern: /\.(ts|tsx|js|jsx|py|mjs|cjs)$/,
  });

  const gods: { file: string; count: number }[] = [];

  for (const file of files) {
    if (/^index\.(ts|tsx|js|jsx|mjs|cjs)$/.test(basename(file))) continue;
    const content = await readFile(file, 'utf8');
    const importCount = content
      .split('\n')
      .filter((line) => /^\s*(import\b|from\s+)/.test(line)).length;
    if (importCount > threshold) {
      gods.push({ file, count: importCount });
    }
  }

  return gods;
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';
  const threshold = options.godModuleImportThreshold ?? 25;

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const pyproject = await readPyproject(root);
    const depCruiser = hasDependencyCruiser(root);
    const importLinter = hasImportLinter(pyproject);
    const archTooling = depCruiser || importLinter;
    const layersOk = await hasLayerRules(root, pyproject);
    const godModules = await findGodModules(root, threshold);
    const noGodModules = godModules.length === 0;

    return [
      binary(
        'forbidden-imports',
        archTooling,
        'architecture tooling present',
        'missing — add dependency-cruiser or import-linter',
        'configure dependency-cruiser (.dependency-cruiser.js) or import-linter in pyproject.toml',
        join(root, 'pyproject.toml'),
      ),
      binary(
        'circular-dependencies',
        archTooling,
        'circular dependency rules configured',
        'missing — add dependency-cruiser or import-linter',
        'dependency-cruiser and import-linter can detect circular imports',
        join(root, 'pyproject.toml'),
      ),
      binary(
        'layer-violations',
        layersOk,
        'layer rules configured',
        'missing — configure layers in import-linter or dependency-cruiser',
        'add layer contracts (import-linter layers or dependency-cruiser rules)',
        join(root, 'pyproject.toml'),
      ),
      {
        slug: 'god-module',
        value: godModules.length,
        score: noGodModules ? 1 : 0,
        displayValue: noGodModules
          ? `no modules exceed ${threshold} imports`
          : `${godModules.length} god module(s)`,
        details: noGodModules
          ? undefined
          : {
              issues: godModules.map((g) => ({
                message: `${g.count} import lines (threshold ${threshold})`,
                severity: 'warning' as const,
                source: { file: g.file, position: { startLine: 1 } },
              })),
            },
      },
    ];
  };
}
