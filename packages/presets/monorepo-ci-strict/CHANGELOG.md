# @awesome-pushup-standards/monorepo-ci-strict

## 0.2.0

### Minor Changes

- 69074a9: Add `rigor: 'base' | 'strict'` contract for wrapper plugins and presets.

  - **Strict** (default for direct plugin use and `*-strict` presets): missing CLI tools return `score: 0`.
  - **Base** (default for stack presets): missing tools return `score: 1` with `… — skipped`; tool-dependent category weights are `0`.
  - New private package `@awesome-pushup-standards/audit-contract` with `toolMissingAudit` and `presetWeight` helpers.

  Migration: pass `rigor: 'strict'` in CI configs; local onboarding can use default `base` on stack presets.

### Patch Changes

- Updated dependencies [69074a9]
- Updated dependencies [69074a9]
  - @awesome-pushup-standards/audit-contract@0.2.0
  - @awesome-pushup-standards/security-sast@1.0.0

## 0.1.0

### Minor Changes

- ec464e2: Initial public release of code-pushup plugins and presets.

### Patch Changes

- Updated dependencies [ec464e2]
  - @awesome-pushup-standards/cicd-quality@0.1.0
  - @awesome-pushup-standards/contributor-hygiene@0.1.0
  - @awesome-pushup-standards/docs-quality@0.1.0
  - @awesome-pushup-standards/release-quality@0.1.0
  - @awesome-pushup-standards/security-sast@0.1.0
