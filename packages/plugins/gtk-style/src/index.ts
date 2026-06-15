import type { PluginConfig } from '@code-pushup/models';
import { audits } from './audits.js';
import { createRunner, type RunnerOptions } from './runner.js';

export type Options = RunnerOptions;

export async function create(options: Options = {}): Promise<PluginConfig> {
  return {
    slug: 'gtk-style',
    title: 'GTK style',
    icon: 'c',
    description: 'Heuristic GNOME/GTK C style checks.',
    audits,
    runner: createRunner(options),
  };
}

export default create;
