# @awesome-pushup-standards/ts-stack-detector

Heuristic plugin detecting TypeScript, Zod, and ESLint setup in JS/TS projects.

## Usage

```ts
import tsStackDetector from '@awesome-pushup-standards/ts-stack-detector';

export default {
  plugins: [await tsStackDetector()],
};
```
