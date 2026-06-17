const GENERATED_DOC_PATTERNS = [
  'apps/docs/doc-registry.json',
  'apps/docs/sidebar.generated.mjs',
  'apps/docs/src/content/docs/plugins/',
  'apps/docs/src/content/docs/presets/',
  'apps/docs/src/content/docs/reference/documentation-registry.md',
  'apps/docs/src/content/docs/reference/plugins-catalog.md',
];

function isGeneratedDoc(file) {
  return GENERATED_DOC_PATTERNS.some((pattern) => file.includes(pattern) || file.endsWith(pattern));
}

export default {
  '*.{js,ts,json,md,yml,yaml}': (files) => {
    const filtered = files.filter((file) => !isGeneratedDoc(file));
    return filtered.length > 0
      ? [`prettier --write ${filtered.map((f) => `"${f}"`).join(' ')}`]
      : [];
  },
  '*.{js,ts}': (files) => {
    const filtered = files.filter((file) => !isGeneratedDoc(file));
    return filtered.length > 0 ? [`eslint --fix ${filtered.map((f) => `"${f}"`).join(' ')}`] : [];
  },
};
