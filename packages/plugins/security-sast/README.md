# @awesome-pushup-standards/security-sast

Security plugin covering secrets scanning config, dependency audits, SAST tooling, and SBOM CI checks.

## Usage

```ts
import securitySast from '@awesome-pushup-standards/security-sast';

export default {
  plugins: [await securitySast({ rootDir: '.' })],
};
```
