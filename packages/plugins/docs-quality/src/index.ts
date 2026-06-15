import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'docs-quality',
    title: 'Documentation quality',
    icon: 'markdown',
    description: 'Checks README, changelog, license, and contributing docs.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
