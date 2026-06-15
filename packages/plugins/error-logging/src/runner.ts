import type { AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem, readJsonFile } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = {
  rootDir?: string;
};

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const BARE_EXCEPT = /^\s*except\s*:/m;
const CONSOLE_LOG = /console\.log\s*\(/;
const IS_TEST_FILE = /(\.test\.|\.spec\.|__tests__|\/tests\/)/;

async function findBareExceptFiles(root: string): Promise<{ file: string; line: number }[]> {
  const hits: { file: string; line: number }[] = [];
  const dirs = ['.', 'src', 'app', 'lib'].map((d) => join(root, d)).filter((d) => existsSync(d));

  for (const dir of dirs) {
    const files = await crawlFileSystem({ directory: dir, pattern: /\.py$/ });
    for (const file of files) {
      if (IS_TEST_FILE.test(file)) continue;
      const content = await readFile(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (BARE_EXCEPT.test(line)) {
          hits.push({ file, line: index + 1 });
        }
      });
    }
  }
  return hits;
}

async function hasPythonLogging(root: string): Promise<boolean> {
  const dirs = ['.', 'src', 'app'].map((d) => join(root, d)).filter((d) => existsSync(d));
  for (const dir of dirs) {
    const files = await crawlFileSystem({ directory: dir, pattern: /\.py$/ });
    for (const file of files.slice(0, 80)) {
      const content = await readFile(file, 'utf8');
      if (/^\s*(import logging|from logging\b)/m.test(content)) return true;
    }
  }
  return false;
}

async function hasJsLogger(root: string): Promise<boolean> {
  const pkgPath = join(root, 'package.json');
  if (!existsSync(pkgPath)) return false;
  const pkg = await readJsonFile<PackageJson>(pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return 'winston' in deps || 'pino' in deps;
}

async function findConsoleLogFiles(root: string): Promise<{ file: string; line: number }[]> {
  const srcDir = join(root, 'src');
  if (!existsSync(srcDir)) return [];

  const files = await crawlFileSystem({
    directory: srcDir,
    pattern: /\.(ts|tsx|js|jsx|mjs|cjs)$/,
  });

  const hits: { file: string; line: number }[] = [];
  for (const file of files) {
    if (IS_TEST_FILE.test(file)) continue;
    const content = await readFile(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (CONSOLE_LOG.test(line)) {
        hits.push({ file, line: index + 1 });
      }
    });
  }
  return hits;
}

export function createRunner(options: RunnerOptions = {}) {
  const root = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const bareExceptHits = await findBareExceptFiles(root);
    const structured = (await hasPythonLogging(root)) || (await hasJsLogger(root));
    const consoleHits = await findConsoleLogFiles(root);

    return [
      {
        slug: 'bare-except',
        value: bareExceptHits.length,
        score: bareExceptHits.length === 0 ? 1 : 0,
        displayValue:
          bareExceptHits.length === 0
            ? 'no bare except'
            : `${bareExceptHits.length} bare except(s)`,
        details:
          bareExceptHits.length === 0
            ? undefined
            : {
                issues: bareExceptHits.map((h) => ({
                  message: 'bare except: — catch specific exceptions',
                  severity: 'warning' as const,
                  source: { file: h.file, position: { startLine: h.line } },
                })),
              },
      },
      {
        slug: 'structured-logging',
        value: structured ? 0 : 1,
        score: structured ? 1 : 0,
        displayValue: structured
          ? 'structured logging present'
          : 'missing — use logging/winston/pino',
        details: structured
          ? undefined
          : {
              issues: [
                {
                  message: 'import logging in Python or add winston/pino in package.json',
                  severity: 'warning',
                },
              ],
            },
      },
      {
        slug: 'no-print-debug',
        value: consoleHits.length,
        score: consoleHits.length === 0 ? 1 : 0,
        displayValue:
          consoleHits.length === 0
            ? 'no console.log in src/'
            : `${consoleHits.length} console.log in src/`,
        details:
          consoleHits.length === 0
            ? undefined
            : {
                issues: consoleHits.map((h) => ({
                  message: 'remove console.log from production src/',
                  severity: 'warning' as const,
                  source: { file: h.file, position: { startLine: h.line } },
                })),
              },
      },
    ];
  };
}
