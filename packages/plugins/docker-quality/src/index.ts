import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'docker-quality',
    title: 'Docker quality',
    icon: 'docker',
    description: 'Wraps hadolint for Dockerfile linting with graceful skip.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
