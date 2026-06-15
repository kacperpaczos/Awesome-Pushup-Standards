import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'python-quality',
    title: 'Python quality',
    icon: 'python',
    description: 'Wraps ruff, mypy, pytest-cov, bandit, and pip-audit.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
