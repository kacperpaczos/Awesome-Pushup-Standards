---
title: "python-quality"
description: "Wrapper plugin for Python quality tools: ruff, mypy, pytest-cov, bandit, pip-audit."
domain: "Python"
packageSlug: "python-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/python-quality/README.md"
---

> **Edit source:** [packages/plugins/python-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/python-quality/README.md) — this page is synced by `npm run docs:sync`.

Wrapper plugin for Python quality tools: ruff, mypy, pytest-cov, bandit, pip-audit.

Missing CLI tools depend on `rigor`: `'strict'` (default) returns `score: 0`; `'base'` returns `score: 1` with `… — skipped`. See [Audit contracts](/reference/audit-contracts/).
## Usage

```ts
import pythonQuality from '@awesome-pushup-standards/python-quality';

export default {
  plugins: [await pythonQuality({ cwd: '.' })],
};
```
