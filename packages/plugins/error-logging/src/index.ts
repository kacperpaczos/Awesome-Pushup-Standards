import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'error-logging',
    title: 'Error handling & logging',
    icon: 'log',
    description:
      'Heuristic checks for bare except, structured logging, and debug console.log in src/.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
