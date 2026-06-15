import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'architecture-rules',
    title: 'Architecture rules',
    icon: 'graphql',
    description: 'Heuristic checks for dependency-cruiser, import-linter, layers, and god modules.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
