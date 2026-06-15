# @awesome-pushup-standards/python-stack-detector

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
