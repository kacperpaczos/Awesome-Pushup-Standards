# @awesome-pushup-standards/python-quality

Wrapper plugin for Python quality tools: ruff, mypy, pytest-cov, bandit, pip-audit.

Tools that are not installed are gracefully skipped (score 1, informational).

## Usage

```ts
import pythonQuality from '@awesome-pushup-standards/python-quality';

export default {
  plugins: [await pythonQuality({ cwd: '.' })],
};
```
