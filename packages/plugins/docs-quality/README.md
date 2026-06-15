# @awesome-pushup-standards/docs-quality

Heuristic plugin checking repository documentation completeness.

## Usage

```ts
import docsQuality from '@awesome-pushup-standards/docs-quality';

export default {
  plugins: [await docsQuality({ rootDir: '.' })],
};
```
