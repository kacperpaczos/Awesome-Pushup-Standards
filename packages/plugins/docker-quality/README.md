# @awesome-pushup-standards/docker-quality

Wrapper plugin for Dockerfile linting via hadolint.

Missing `hadolint`: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.

## Audits

- `hadolint-violations` — runs `hadolint` when available

## Usage

```ts
import dockerQuality from '@awesome-pushup-standards/docker-quality';

export default {
  plugins: [await dockerQuality({ rootDir: '.' })],
};
```
