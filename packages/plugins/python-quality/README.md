# @awesome-pushup-standards/python-quality

Wrapper plugin for Python quality tools: ruff, mypy, pytest-cov, bandit, pip-audit.

Missing CLI tools depend on `rigor`: `'strict'` (default) returns `score: 0`; `'base'` returns `score: 1` with `… — skipped`. See [Audit contracts](/reference/audit-contracts/).

## Usage

```ts
import pythonQuality from '@awesome-pushup-standards/python-quality';

export default {
  plugins: [await pythonQuality({ cwd: '.' })],
};
```
