import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export async function create(options: RunnerOptions = {}): Promise<PluginConfig> {
  return {
    slug: 'contributor-hygiene',
    title: 'Contributor hygiene',
    icon: 'settings',
    description: 'Shift-left checks: commitlint, husky, prettier, knip, .env.example.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
