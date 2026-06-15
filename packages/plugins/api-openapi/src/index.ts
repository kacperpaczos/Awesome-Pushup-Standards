import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'api-openapi',
    title: 'API OpenAPI quality',
    icon: 'openapi',
    description:
      'Heuristic and Spectral checks for OpenAPI specs, versioning, and schema-first design.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
