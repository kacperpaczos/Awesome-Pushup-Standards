import { describe, expect, it } from 'vitest';
import { presetWeight, toolMissingAudit } from '../src/index.js';

describe('audit-contract', () => {
  it('toolMissingAudit returns skip in base rigor', () => {
    const out = toolMissingAudit('ruff-lint', 'ruff', 'base');
    expect(out.score).toBe(1);
    expect(out.displayValue).toContain('skipped');
  });

  it('toolMissingAudit returns fail in strict rigor', () => {
    const out = toolMissingAudit('ruff-lint', 'ruff', 'strict');
    expect(out.score).toBe(0);
    expect(out.displayValue).toBe('ruff not installed');
  });

  it('presetWeight zeroes tool-dependent refs in base rigor', () => {
    expect(presetWeight(50, 'base', true)).toBe(0);
    expect(presetWeight(50, 'strict', true)).toBe(50);
    expect(presetWeight(50, 'base', false)).toBe(50);
  });
});
