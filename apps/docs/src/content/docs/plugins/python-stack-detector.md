---
title: "python-stack-detector"
description: "Heuristic plugin that detects Python stack tooling in `pyproject.toml` and suggests quality leaps."
domain: "Python"
packageSlug: "python-stack-detector"
packageKind: "plugin"
sourceReadme: "packages/plugins/python-stack-detector/README.md"
---

> **Edit source:** [packages/plugins/python-stack-detector/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/python-stack-detector/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin that detects Python stack tooling in `pyproject.toml` and suggests quality leaps.
## Audits

- `has-pydantic` — pydantic in dependencies
- `has-type-checker` — `[tool.mypy]` or ty configured
- `has-ruff` — `[tool.ruff]` configured
- `has-security-tooling` — bandit or pip-audit referenced
## Usage

```ts
import pythonStackDetector from '@awesome-pushup-standards/python-stack-detector';

export default {
  plugins: [await pythonStackDetector({ pyprojectPath: 'pyproject.toml' })],
};
```
