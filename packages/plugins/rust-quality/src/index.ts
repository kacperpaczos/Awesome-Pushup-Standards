import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'rust-quality',
    title: 'Rust quality',
    icon: 'rust',
    description: 'Wraps cargo clippy, rustfmt, cargo-audit, and tarpaulin.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
