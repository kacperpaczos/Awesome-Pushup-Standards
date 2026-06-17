---
title: 'gtk-style'
description: 'Heuristic plugin for GNOME/GTK C style conventions.'
domain: 'GTK/GNOME'
packageSlug: 'gtk-style'
packageKind: 'plugin'
sourceReadme: 'packages/plugins/gtk-style/README.md'
---

> **Edit source:** [packages/plugins/gtk-style/README.md](https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main/packages/plugins/gtk-style/README.md) — this page is synced by `npm run docs:sync`.

Heuristic plugin for GNOME/GTK C style conventions.

## Audits

- `gobject-macros` — `G_DECLARE_*` and `G_DEFINE_TYPE_WITH_PRIVATE` in `.c` files
- `availability-annotations` — `GDK_AVAILABLE_IN_*` macros where GTK/GDK APIs are used
- `style-consistency` — no trailing whitespace in sampled sources

## Usage

```ts
import gtkStyle from '@awesome-pushup-standards/gtk-style';

export default {
  plugins: [await gtkStyle({ rootDir: '.', sourceDir: 'src/' })],
};
```
