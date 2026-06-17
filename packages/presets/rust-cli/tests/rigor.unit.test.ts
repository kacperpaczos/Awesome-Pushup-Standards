import type { CoreConfig } from '@code-pushup/models';
import { describe, expect, it } from 'vitest';
import { create } from '../src/index.js';

function auditWeights(config: CoreConfig) {
  return config.categories.flatMap((category) =>
    category.refs
      .filter((ref) => ref.type === 'audit')
      .map((ref) => ({
        category: category.slug,
        plugin: ref.plugin,
        slug: ref.slug,
        weight: ref.weight,
      })),
  );
}

describe('rust-cli preset rigor', () => {
  it('zeroes tool-dependent audit weights in base rigor', async () => {
    const config = await create({ rigor: 'base' });
    const weights = auditWeights(config);

    expect(weights.find((w) => w.slug === 'clippy-warnings')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'format-check')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'module-cycles')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'dependency-audit')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'readme-completeness')?.weight).toBe(40);
  });

  it('keeps tool-dependent audit weights in strict rigor', async () => {
    const config = await create({ rigor: 'strict' });
    const weights = auditWeights(config);

    expect(weights.find((w) => w.slug === 'clippy-warnings')?.weight).toBe(50);
    expect(weights.find((w) => w.slug === 'format-check')?.weight).toBe(20);
    expect(weights.find((w) => w.slug === 'module-cycles')?.weight).toBe(50);
    expect(weights.find((w) => w.slug === 'dependency-audit')?.weight).toBe(20);
    expect(weights.find((w) => w.slug === 'readme-completeness')?.weight).toBe(40);
  });
});
