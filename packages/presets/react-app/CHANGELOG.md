# @awesome-pushup-standards/react-app

## 0.2.0

### Minor Changes

- 69074a9: Add `rigor: 'base' | 'strict'` contract for wrapper plugins and presets.

  - **Strict** (default for direct plugin use and `*-strict` presets): missing CLI tools return `score: 0`.
  - **Base** (default for stack presets): missing tools return `score: 1` with `… — skipped`; tool-dependent category weights are `0`.
  - New private package `@awesome-pushup-standards/audit-contract` with `toolMissingAudit` and `presetWeight` helpers.

  Migration: pass `rigor: 'strict'` in CI configs; local onboarding can use default `base` on stack presets.

- e558bb2: All presets now wire every loaded plugin into a scoring category. Previously, `security-sast`, `architecture-rules`, `docs-quality`, `coverage`, and `docker-quality` were loaded but orphaned — they collected data without contributing to any score.

  New categories added per preset:

  - **react-app**: `security` (security-sast), `architecture` (architecture-rules), `test-coverage` (coverage)
  - **rust-cli**: `security` (security-sast + rust-quality advisory), `documentation` (docs-quality)
  - **cpp-qt-desktop**: `security` (security-sast), `documentation` (docs-quality), `deployment` (docker-quality, when `includeDocker: true`)
  - **gtk-desktop**: `security` (security-sast), `documentation` (docs-quality)
  - **python-backend-strict**: `security` now includes python-quality bandit/dependency audits; `deployment` (docker-quality) added

### Patch Changes

- Updated dependencies [abb6bce]
- Updated dependencies [69074a9]
- Updated dependencies [69074a9]
  - @awesome-pushup-standards/architecture-rules@1.0.0
  - @awesome-pushup-standards/audit-contract@0.2.0
  - @awesome-pushup-standards/security-sast@1.0.0

## 0.1.0

### Minor Changes

- ec464e2: Initial public release of code-pushup plugins and presets.

### Patch Changes

- Updated dependencies [ec464e2]
  - @awesome-pushup-standards/architecture-rules@0.1.0
  - @awesome-pushup-standards/react-standards@0.1.0
  - @awesome-pushup-standards/security-sast@0.1.0
  - @awesome-pushup-standards/ts-stack-detector@0.1.0
