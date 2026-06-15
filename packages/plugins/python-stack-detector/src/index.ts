import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'python-stack-detector',
    title: 'Python stack detector',
    icon: 'python',
    description: 'Heuristic plugin suggesting pydantic/mypy/ruff/bandit when absent.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
