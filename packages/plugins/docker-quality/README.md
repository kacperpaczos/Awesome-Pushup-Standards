# @awesome-pushup-standards/docker-quality

Wrapper plugin for Dockerfile linting via hadolint.

## Audits

- `hadolint-violations` — runs `hadolint` when available

## Usage

```ts
import dockerQuality from '@awesome-pushup-standards/docker-quality';

export default {
  plugins: [await dockerQuality({ rootDir: '.' })],
};
```
