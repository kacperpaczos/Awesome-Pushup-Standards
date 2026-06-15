# @awesome-pushup-standards/cicd-quality

Heuristic plugin for GitHub Actions workflow quality.

## Audits

- `ci-present` — `.github/workflows` contains workflow files
- `actions-pinned` — majority of `uses:` references pinned to commit SHA (score 1 if majority SHA)
- `dependency-scanning-in-ci` — trivy, pip-audit, npm audit, or grype in workflows

## Usage

```ts
import cicdQuality from '@awesome-pushup-standards/cicd-quality';

export default {
  plugins: [await cicdQuality({ rootDir: '.' })],
};
```
