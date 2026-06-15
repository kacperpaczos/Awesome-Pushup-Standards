# @awesome-pushup-standards/gtk-style

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
