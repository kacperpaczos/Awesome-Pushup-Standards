import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'security-sast',
    title: 'Security SAST',
    icon: 'lock',
    description: 'Security checks: secrets, dependency audit, SAST tooling, SBOM.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
