---
title: "rust-quality"
description: "Wraps `cargo clippy`, `rustfmt`, `cargo audit`, and `cargo tarpaulin`."
domain: "Rust"
packageSlug: "rust-quality"
packageKind: "plugin"
sourceReadme: "packages/plugins/rust-quality/README.md"
---

> **Edit source:** [packages/plugins/rust-quality/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/rust-quality/README.md) — this page is synced by `npm run docs:sync`.

Wraps `cargo clippy`, `rustfmt`, `cargo audit`, and `cargo tarpaulin`.

Missing CLI tools: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`. See [Audit contracts](/reference/audit-contracts/).

```ts
import rustQuality from '@awesome-pushup-standards/rust-quality';
export default { plugins: [await rustQuality()] };
```
