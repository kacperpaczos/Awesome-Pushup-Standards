import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'react-standards',
    title: 'React standards',
    icon: 'react',
    description:
      'Heuristic checks for React 19, state libraries, hooks rules, forms, bundle budget, and a11y.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
