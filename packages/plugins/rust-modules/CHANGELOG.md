# @awesome-pushup-standards/rust-modules

## 1.0.0

### Major Changes

- 69074a9: **Breaking (strict rigor only):** audits return `score: 0` when a required external tool is not installed and `rigor` is `'strict'` (the default when calling plugins directly).

  With `rigor: 'base'`, missing tools return `score: 1` and `displayValue` containing `skipped`. See [Audit contracts](/reference/audit-contracts/).

  Previously, missing tools silently passed with a perfect score. Migration: use `rigor: 'strict'` in CI or install required tools.

### Minor Changes

- 69074a9: Add `rigor: 'base' | 'strict'` contract for wrapper plugins and presets.

  - **Strict** (default for direct plugin use and `*-strict` presets): missing CLI tools return `score: 0`.
  - **Base** (default for stack presets): missing tools return `score: 1` with `… — skipped`; tool-dependent category weights are `0`.
  - New private package `@awesome-pushup-standards/audit-contract` with `toolMissingAudit` and `presetWeight` helpers.

  Migration: pass `rigor: 'strict'` in CI configs; local onboarding can use default `base` on stack presets.

### Patch Changes

- Updated dependencies [69074a9]
  - @awesome-pushup-standards/audit-contract@0.2.0

## 0.1.0

### Minor Changes

- ec464e2: Initial public release of code-pushup plugins and presets.
