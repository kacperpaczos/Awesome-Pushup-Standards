import type { AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseBandit, parseCoverage, parseMypy, parsePipAudit, parseRuff } from './lib/parsers.js';
import { runTool } from './lib/run-tool.js';

export type RunnerOptions = {
  cwd?: string;
};

function banditArgs(cwd: string): string[] {
  const args = ['-r', '.', '-f', 'json', '-q'];
  if (existsSync(join(cwd, 'pyproject.toml'))) {
    return ['-c', 'pyproject.toml', ...args];
  }
  return args;
}

export function createRunner(options: RunnerOptions = {}) {
  const cwd = options.cwd ?? '.';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const [ruff, mypy, coverage, bandit, pipAudit] = await Promise.all([
      runTool('ruff', ['check', '--output-format=json', '.'], cwd),
      runTool('mypy', ['--no-error-summary', '.'], cwd),
      runTool('pytest', ['--cov=.', '--cov-report=json', '-q', '--tb=no'], cwd),
      runTool('bandit', banditArgs(cwd), cwd),
      runTool('pip-audit', ['--format=json'], cwd),
    ]);

    return [
      parseRuff(ruff),
      parseMypy(mypy),
      parseCoverage(coverage),
      parseBandit(bandit),
      parsePipAudit(pipAudit),
    ];
  };
}
