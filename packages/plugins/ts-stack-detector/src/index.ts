import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'ts-stack-detector',
    title: 'TypeScript stack detector',
    icon: 'typescript',
    description: 'Heuristic plugin suggesting TypeScript, Zod, and ESLint when absent.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
