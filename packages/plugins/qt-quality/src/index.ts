import type { MaterialIcon, PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'qt-quality',
    title: 'Qt quality',
    icon: 'cpp' satisfies MaterialIcon,
    description: 'Heuristic Qt checks and optional clazy detection.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
