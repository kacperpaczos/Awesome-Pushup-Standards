# @awesome-pushup-standards/rust-quality

Wraps `cargo clippy`, `rustfmt`, `cargo audit`, and `cargo tarpaulin`. Missing tools are gracefully skipped.

```ts
import rustQuality from '@awesome-pushup-standards/rust-quality';
export default { plugins: [await rustQuality()] };
```
