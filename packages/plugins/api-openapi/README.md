# @awesome-pushup-standards/api-openapi

Heuristic plugin for OpenAPI spec presence, Spectral linting, API versioning, and schema-first design.

## Audits

- `has-openapi-spec` — `openapi.yaml` / `openapi.json` exists
- `spectral-violations` — runs `spectral lint` when Spectral CLI is installed
- `api-versioning` — `info.version` and `/v1/` paths or `deprecated` markers
- `schema-first` — spec file present without heavy code-first decorator signals

## Usage

```ts
import apiOpenapi from '@awesome-pushup-standards/api-openapi';

export default {
  plugins: [await apiOpenapi({ rootDir: '.' })],
};
```
