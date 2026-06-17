---
'@awesome-pushup-standards/audit-contract': minor
'@awesome-pushup-standards/python-quality': minor
'@awesome-pushup-standards/rust-quality': minor
'@awesome-pushup-standards/rust-modules': minor
'@awesome-pushup-standards/cpp-quality': minor
'@awesome-pushup-standards/docker-quality': minor
'@awesome-pushup-standards/qt-quality': minor
'@awesome-pushup-standards/api-openapi': minor
'@awesome-pushup-standards/security-sast': minor
'@awesome-pushup-standards/rust-cli': minor
'@awesome-pushup-standards/react-app': minor
'@awesome-pushup-standards/cpp-qt-desktop': minor
'@awesome-pushup-standards/gtk-desktop': minor
'@awesome-pushup-standards/python-backend-strict': minor
'@awesome-pushup-standards/monorepo-ci-strict': minor
---

Add `rigor: 'base' | 'strict'` contract for wrapper plugins and presets.

- **Strict** (default for direct plugin use and `*-strict` presets): missing CLI tools return `score: 0`.
- **Base** (default for stack presets): missing tools return `score: 1` with `… — skipped`; tool-dependent category weights are `0`.
- New private package `@awesome-pushup-standards/audit-contract` with `toolMissingAudit` and `presetWeight` helpers.

Migration: pass `rigor: 'strict'` in CI configs; local onboarding can use default `base` on stack presets.
