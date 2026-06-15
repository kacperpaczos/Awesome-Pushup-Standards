import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export async function create(options: RunnerOptions = {}): Promise<PluginConfig> {
  return {
    slug: 'release-quality',
    title: 'Release quality',
    icon: 'npm',
    description: 'Supply chain CD checks: OIDC publish, separated release, SECURITY.md.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
