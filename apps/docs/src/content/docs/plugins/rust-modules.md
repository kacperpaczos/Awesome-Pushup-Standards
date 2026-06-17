---
title: "rust-modules"
description: "Architecture checks for Rust: module cycles and cargo-deny banned dependencies."
domain: "Rust"
packageSlug: "rust-modules"
packageKind: "plugin"
sourceReadme: "packages/plugins/rust-modules/README.md"
---

> **Edit source:** [packages/plugins/rust-modules/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/rust-modules/README.md) — this page is synced by `npm run docs:sync`.

Architecture checks for Rust: module cycles and cargo-deny banned dependencies.

Missing CLI tools (`cargo-modules`, `cargo-deny`): `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`.
