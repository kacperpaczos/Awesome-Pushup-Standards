# @awesome-pushup-standards/security-sast

Security plugin covering secrets scanning config, dependency audits, SAST tooling, and SBOM CI checks.

Missing dependency audit CLI (`pip-audit`, `cargo audit`): `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.

## Usage

```ts
import securitySast from '@awesome-pushup-standards/security-sast';

export default {
  plugins: [await securitySast({ rootDir: '.' })],
};
```
