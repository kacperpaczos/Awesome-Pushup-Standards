import { describe, expect, it } from 'vitest';
import { skippedAudit } from '../src/lib/run-tool.js';

describe('rust-quality', () => {
  it('skipped audit has score 1', () => {
    const out = skippedAudit('clippy-warnings', 'cargo clippy');
    expect(out.score).toBe(1);
    expect(out.displayValue).toContain('skipped');
  });
});
