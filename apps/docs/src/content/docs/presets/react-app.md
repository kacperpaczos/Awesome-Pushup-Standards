---
title: 'react-app'
description: 'React application preset combining official code-pushup plugins with ts-stack-detector and security-sast.'
domain: 'React'
packageSlug: 'react-app'
packageKind: 'preset'
sourceReadme: 'packages/presets/react-app/README.md'
---

> **Edit source:** [packages/presets/react-app/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/presets/react-app/README.md) — this page is synced by `npm run docs:sync`.

React application preset combining official code-pushup plugins with ts-stack-detector and security-sast.

## Usage

```ts
import reactApp from '@awesome-pushup-standards/react-app';

export default await reactApp({ rootDir: '.', axeUrl: 'http://localhost:4173' });
```
