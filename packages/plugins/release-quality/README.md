# release-quality

Release and supply-chain CD checks: OIDC npm publish, separated workflows, SECURITY.md.

## Usage

```ts
import releaseQuality from '@awesome-pushup-standards/release-quality';

export default {
  plugins: [await releaseQuality({ rootDir: '.' })],
};
```
