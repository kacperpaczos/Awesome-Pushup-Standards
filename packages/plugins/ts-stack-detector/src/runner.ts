import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem, readJsonFile } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = {
  packageJsonPath?: string;
  scanSource?: boolean;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function check(slug: string, present: boolean, hint: string, file: string): AuditOutput {
  return {
    slug,
    value: present ? 0 : 1,
    score: present ? 1 : 0,
    displayValue: present ? 'present' : `missing — ${hint}`,
    details: present
      ? undefined
      : {
          issues: [
            {
              message: hint,
              severity: 'warning',
              source: { file, position: { startLine: 1 } },
            },
          ],
        },
  };
}

function allDeps(pkg: PackageJson): Record<string, string> {
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

function hasDep(pkg: PackageJson, name: string): boolean {
  return name in allDeps(pkg);
}

const FORM_API_DEPS = ['react-hook-form', 'fastify', 'express', '@hono/hono', 'hono'];

async function needsZod(pkg: PackageJson, root: string, scanSource: boolean): Promise<boolean> {
  if (FORM_API_DEPS.some((d) => hasDep(pkg, d))) return true;
  if (!scanSource || !existsSync(join(root, 'src'))) return false;

  const files = await crawlFileSystem({
    directory: join(root, 'src'),
    pattern: /\.(tsx?|jsx?)$/,
  });

  for (const file of files.slice(0, 50)) {
    const content = await readFile(file, 'utf8');
    if (/useForm|FormData|z\.object/.test(content)) return true;
  }
  return false;
}

export function createRunner(options: RunnerOptions = {}) {
  const packageJsonPath = options.packageJsonPath ?? 'package.json';
  const scanSource = options.scanSource ?? true;
  const root = join(packageJsonPath, '..');

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    if (!existsSync(packageJsonPath)) {
      return [
        check('suggest-typescript', false, 'add package.json with typescript', packageJsonPath),
        check('suggest-zod', false, 'add zod for validation', packageJsonPath),
        check('suggest-eslint', false, 'configure ESLint', packageJsonPath),
      ];
    }

    const pkg = await readJsonFile<PackageJson>(packageJsonPath);
    const hasTs = hasDep(pkg, 'typescript');
    const hasEslint = hasDep(pkg, 'eslint');
    const hasZod = hasDep(pkg, 'zod');
    const zodNeeded = await needsZod(pkg, root === '.' ? '.' : root, scanSource);

    return [
      check(
        'suggest-typescript',
        hasTs,
        'migrate to TypeScript — add typescript devDependency',
        packageJsonPath,
      ),
      check('suggest-zod', !zodNeeded || hasZod, 'add zod for runtime validation', packageJsonPath),
      check(
        'suggest-eslint',
        hasEslint,
        'configure ESLint — add eslint devDependency',
        packageJsonPath,
      ),
    ];
  };
}
