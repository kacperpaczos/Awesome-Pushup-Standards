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

describe('python-backend-strict preset rigor', () => {
  it('zeroes tool-dependent audit weights in base rigor', async () => {
    const config = await create({ rigor: 'base' });
    const weights = auditWeights(config);

    expect(weights.find((w) => w.slug === 'ruff-lint')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'hadolint-violations')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'spectral-violations')?.weight).toBe(0);
    expect(weights.find((w) => w.slug === 'readme-completeness')?.weight).toBeGreaterThan(0);
  });

  it('keeps tool-dependent audit weights in strict rigor (default)', async () => {
    const config = await create();
    const weights = auditWeights(config);

    expect(weights.find((w) => w.slug === 'ruff-lint')?.weight).toBeGreaterThan(0);
    expect(weights.find((w) => w.slug === 'hadolint-violations')?.weight).toBeGreaterThan(0);
    expect(weights.find((w) => w.slug === 'spectral-violations')?.weight).toBeGreaterThan(0);
    expect(weights.find((w) => w.slug === 'readme-completeness')?.weight).toBeGreaterThan(0);
  });
});
