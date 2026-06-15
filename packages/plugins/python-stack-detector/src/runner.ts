import type { AuditOutput, AuditOutputs, RunnerArgs } from '@code-pushup/models';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export type RunnerOptions = {
  pyprojectPath?: string;
};

function check(slug: string, present: boolean, hint: string, pyproject: string): AuditOutput {
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
              source: { file: pyproject, position: { startLine: 1 } },
            },
          ],
        },
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const pyproject = options.pyprojectPath ?? 'pyproject.toml';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const content = existsSync(pyproject) ? await readFile(pyproject, 'utf8') : '';

    return [
      check(
        'has-pydantic',
        /pydantic/.test(content),
        'add pydantic for runtime validation',
        pyproject,
      ),
      check(
        'has-type-checker',
        /\[tool\.mypy\]|\bty\b/.test(content),
        'configure mypy or ty',
        pyproject,
      ),
      check(
        'has-ruff',
        /\[tool\.ruff\]/.test(content),
        'configure ruff for lint+format',
        pyproject,
      ),
      check(
        'has-security-tooling',
        /bandit|pip-audit/.test(content),
        'add bandit and pip-audit',
        pyproject,
      ),
    ];
  };
}
