import { describe, expect, it } from 'vitest';
import { parseRuff } from '../src/lib/parsers.js';

describe('python-quality parsers', () => {
  it('parses empty ruff output as score 1', () => {
    const output = parseRuff({ status: 'ok', stdout: '[]', stderr: '', code: 0 });
    expect(output.score).toBe(1);
  });

  it('returns score 0 when ruff not installed (strict rigor default)', () => {
    const output = parseRuff({ status: 'skipped', reason: 'ruff not found' });
    expect(output.score).toBe(0);
    expect(output.displayValue).toBe('ruff not installed');
  });

  it('returns score 1 skip when ruff not installed in base rigor', () => {
    const output = parseRuff({ status: 'skipped', reason: 'ruff not found' }, 'base');
    expect(output.score).toBe(1);
    expect(output.displayValue).toBe('ruff not installed — skipped');
  });
});
