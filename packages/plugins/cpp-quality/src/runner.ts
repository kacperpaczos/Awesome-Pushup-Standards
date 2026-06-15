import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { runTool, skippedAudit } from './lib/run-tool.js';

export type RunnerOptions = { cwd?: string };

const CLANG_TIDY_CHECKS = 'bugprone-*,modernize-*,performance-*,readability-*';

async function sourceFiles(cwd: string): Promise<string[]> {
  return crawlFileSystem({
    directory: cwd,
    pattern: /\.(c|cc|cpp|cxx|h|hpp|hxx)$/,
  });
}

function toolAudit(
  slug: string,
  tool: string,
  result: Awaited<ReturnType<typeof runTool>>,
  okLabel: string,
  failLabel: string,
): AuditOutput {
  if (result.status === 'skipped') return skippedAudit(slug, tool);
  const ok = result.status === 'ok';
  return {
    slug,
    value: ok ? 0 : 1,
    score: ok ? 1 : 0,
    displayValue: ok ? okLabel : failLabel,
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const cwd = options.cwd ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const files = await sourceFiles(cwd);
    const compileDb = ['build', 'cmake-build-debug', '.'].find((dir) =>
      existsSync(join(cwd, dir, 'compile_commands.json')),
    );
    const compileDir = compileDb ?? 'build';

    const clangTidyArgs =
      files.length > 0
        ? ['-p', compileDir, `--checks=${CLANG_TIDY_CHECKS}`, ...files.slice(0, 20)]
        : ['--version'];

    const [clangTidy, cppcheck, clangFormat] = await Promise.all([
      runTool('clang-tidy', clangTidyArgs, cwd),
      runTool('cppcheck', ['--enable=all', '--quiet', '--error-exitcode=1', '.'], cwd),
      files.length > 0
        ? runTool('clang-format', ['--dry-run', '--Werror', ...files.slice(0, 50)], cwd)
        : runTool('clang-format', ['--version'], cwd),
    ]);

    return [
      toolAudit(
        'clang-tidy-warnings',
        'clang-tidy',
        clangTidy,
        'no warnings',
        'clang-tidy warnings',
      ),
      toolAudit('cppcheck-issues', 'cppcheck', cppcheck, 'no issues', 'cppcheck issues'),
      toolAudit('format-violations', 'clang-format', clangFormat, 'formatted', 'format violations'),
    ];
  };
}
