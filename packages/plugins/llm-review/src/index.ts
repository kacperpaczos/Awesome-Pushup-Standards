import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { getLlmConfigFromEnv } from './lib/llm-client.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  const llmConfigured = getLlmConfigFromEnv() !== null;

  return {
    slug: 'llm-review',
    title: 'LLM code review',
    icon: 'robot',
    description: 'Optional LLM rubric review (architecture, naming, consistency, readability).',
    isSkipped: !llmConfigured,
    audits,
    runner: createRunner(options),
  };
}

export default create;
