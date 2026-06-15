# @awesome-pushup-standards/architecture-rules

Heuristic plugin for architecture fitness functions: forbidden imports, cycles, layers, and god modules.

## Audits

- `forbidden-imports` — dependency-cruiser or import-linter configured
- `circular-dependencies` — same architecture tooling present
- `layer-violations` — layer rules in import-linter or dependency-cruiser
- `god-module` — no file in `src/` exceeds import line threshold (default 15)

## Usage

```ts
import architectureRules from '@awesome-pushup-standards/architecture-rules';

export default {
  plugins: [await architectureRules({ rootDir: '.', godModuleImportThreshold: 15 })],
};
```
