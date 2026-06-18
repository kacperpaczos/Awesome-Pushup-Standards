---
title: "react-standards"
description: "Heuristic plugin for React project standards based on `package.json` and Vite config."
domain: "React"
packageSlug: "react-standards"
packageKind: "plugin"
sourceReadme: "packages/plugins/react-standards/README.md"
---

> **Edit source:** [packages/plugins/react-standards/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/react-standards/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for React project standards based on `package.json` and Vite config.
## Audits

- `react-version` — `react` >= 19 in dependencies
- `recommended-state-libs` — `@tanstack/react-query` or `zustand` present
- `hooks-rules` — `eslint-plugin-react-hooks` in devDependencies
- `forms-validation` — `react-hook-form` + `zod` present
- `bundle-size` — bundle size budget in `package.json` or Vite config (**informational**, use weight `0` in presets)
- `accessibility` — `eslint-plugin-jsx-a11y` or axe plugin (**informational**, use weight `0` in presets)
## Usage

```ts
import reactStandards from '@awesome-pushup-standards/react-standards';

export default {
  plugins: [await reactStandards({ packageJsonPath: 'package.json' })],
};
```
