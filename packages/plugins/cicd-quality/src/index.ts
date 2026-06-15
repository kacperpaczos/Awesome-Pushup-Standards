import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'cicd-quality',
    title: 'CI/CD quality',
    icon: 'folder-github',
    description:
      'Heuristic checks for GitHub Actions presence, SHA pinning, and dependency scanning.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
