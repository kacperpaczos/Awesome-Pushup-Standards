# @awesome-pushup-standards/rust-quality

Wraps `cargo clippy`, `rustfmt`, `cargo audit`, and `cargo tarpaulin`.

Missing CLI tools: `rigor: 'strict'` (default) returns `score: 0`; `rigor: 'base'` returns `score: 1` with `… — skipped`. See [Audit contracts](/reference/audit-contracts/).

```ts
import rustQuality from '@awesome-pushup-standards/rust-quality';
export default { plugins: [await rustQuality()] };
```
