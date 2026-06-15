# contributor-hygiene

Shift-left contributor checks: conventional commits, husky, prettier, knip.

## Usage

```ts
import contributorHygiene from '@awesome-pushup-standards/contributor-hygiene';

export default {
  plugins: [await contributorHygiene({ rootDir: '.' })],
};
```
