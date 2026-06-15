import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runTool, skippedAudit } from './lib/run-tool.js';

export type RunnerOptions = { rootDir?: string };

async function readOptional(path: string): Promise<string> {
  if (!existsSync(path)) return '';
  return readFile(path, 'utf8');
}

function hasClazyConfig(rootDir: string, cmake: string): boolean {
  return existsSync(join(rootDir, '.clazy')) || /\bclazy\b/i.test(cmake);
}

function isQtProject(cmake: string): boolean {
  return /find_package\s*\(\s*Qt[56]|Qt[56]::/i.test(cmake);
}

function hasQtClangTidyChecks(clangTidy: string): boolean {
  return /qt-|Qt|qtcore|qtgui/i.test(clangTidy);
}

export function createRunner(options: RunnerOptions = {}) {
  const rootDir = options.rootDir ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const cmakePath = join(rootDir, 'CMakeLists.txt');
    const cmake = await readOptional(cmakePath);
    const clangTidyPath = join(rootDir, '.clang-tidy');
    const clangTidy = await readOptional(clangTidyPath);

    let clazyOut: AuditOutput;
    if (hasClazyConfig(rootDir, cmake)) {
      clazyOut = {
        slug: 'clazy-warnings',
        value: 0,
        score: 1,
        displayValue: 'clazy configured',
      };
    } else {
      const clazy = await runTool('clazy', ['--version'], rootDir);
      if (clazy.status === 'skipped') {
        clazyOut = skippedAudit('clazy-warnings', 'clazy');
      } else {
        clazyOut = {
          slug: 'clazy-warnings',
          value: 0,
          score: 1,
          displayValue: 'clazy available',
        };
      }
    }

    let qtApiOut: AuditOutput;
    if (!isQtProject(cmake)) {
      qtApiOut = {
        slug: 'qt-api-misuse',
        value: 0,
        score: 1,
        displayValue: 'not a Qt project — skipped',
      };
    } else if (hasQtClangTidyChecks(clangTidy)) {
      qtApiOut = {
        slug: 'qt-api-misuse',
        value: 0,
        score: 1,
        displayValue: 'Qt clang-tidy checks configured',
      };
    } else {
      qtApiOut = {
        slug: 'qt-api-misuse',
        value: 1,
        score: 0,
        displayValue: 'missing Qt checks in .clang-tidy',
        details: {
          issues: [
            {
              message: 'add Qt-related checks to .clang-tidy for Qt API misuse detection',
              severity: 'warning',
              source: { file: clangTidyPath, position: { startLine: 1 } },
            },
          ],
        },
      };
    }

    return [clazyOut, qtApiOut];
  };
}
