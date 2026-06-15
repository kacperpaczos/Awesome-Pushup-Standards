import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'cpp-quality',
    title: 'C++ quality',
    icon: 'cpp',
    description: 'Wraps clang-tidy, cppcheck, and clang-format with graceful skip.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
