import { describe, expect, it } from 'vitest';
import { parseRuff } from '../src/lib/parsers.js';

describe('python-quality parsers', () => {
  it('parses empty ruff output as score 1', () => {
    const output = parseRuff({ status: 'ok', stdout: '[]', stderr: '', code: 0 });
    expect(output.score).toBe(1);
  });

  it('skips when ruff not found', () => {
    const output = parseRuff({ status: 'skipped', reason: 'ruff not found' });
    expect(output.score).toBe(1);
    expect(output.displayValue).toContain('skipped');
  });
});
