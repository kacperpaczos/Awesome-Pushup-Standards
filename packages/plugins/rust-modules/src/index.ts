import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export async function create(options: RunnerOptions = {}): Promise<PluginConfig> {
  return {
    slug: 'rust-modules',
    title: 'Rust module architecture',
    icon: 'rust',
    description: 'Checks module cycles and banned dependencies via cargo-modules/deny.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
