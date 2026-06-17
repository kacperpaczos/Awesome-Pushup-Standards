#!/usr/bin/env node
/**
 * Sync package READMEs into Starlight content, update doc-registry.json,
 * generate documentation-registry.md and sidebar.generated.mjs.
 *
 * Run: npm run docs:sync
 */
import { execSync } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GENERATED_DOC_PATHS } from './docs-generated-paths.mjs';
import { OFFICIAL_PLUGIN_LABELS, PLUGIN_CATALOG_META } from './plugin-catalog-meta.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = join(repoRoot, 'apps/docs');
const contentRoot = join(docsRoot, 'src/content/docs');
const pluginsOut = join(contentRoot, 'plugins');
const presetsOut = join(contentRoot, 'presets');

const GITHUB = 'https://github.com/kacperpaczos/Awesome-Pushup-Standards/blob/main';

/** @type {Record<string, string>} */
const PLUGIN_DOMAINS = {
  'python-stack-detector': 'Python',
  'python-quality': 'Python',
  'rust-quality': 'Rust',
  'rust-modules': 'Rust',
  'ts-stack-detector': 'JS/TS',
  'cpp-quality': 'C++',
  'qt-quality': 'Qt',
  'gtk-style': 'GTK/GNOME',
  'architecture-rules': 'Architecture',
  'api-openapi': 'API design',
  'react-standards': 'React',
  'error-logging': 'Error handling',
  'security-sast': 'Security',
  'docker-quality': 'Docker',
  'docs-quality': 'Documentation',
  'cicd-quality': 'CI/CD',
  'contributor-hygiene': 'CI/CD',
  'release-quality': 'CI/CD',
  'llm-review': 'LLM review',
};

/** @type {Record<string, string>} */
const PRESET_DOMAINS = {
  'python-backend-strict': 'Python',
  'react-app': 'React',
  'rust-cli': 'Rust',
  'cpp-qt-desktop': 'C++/Qt',
  'gtk-desktop': 'GTK/GNOME',
  'monorepo-ci-strict': 'CI/CD',
};

const DOMAIN_ORDER = [
  'Python',
  'Rust',
  'JS/TS',
  'C++',
  'Qt',
  'C++/Qt',
  'GTK/GNOME',
  'Architecture',
  'API design',
  'React',
  'Error handling',
  'Security',
  'Docker',
  'Documentation',
  'CI/CD',
  'LLM review',
];

function escapeYaml(value) {
  return JSON.stringify(String(value));
}

function extractTitle(readme, slug) {
  const heading = readme.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].replace(/^@awesome-pushup-standards\//, '').trim();
  }
  return slug;
}

function extractDescription(readme) {
  const lines = readme.split('\n');
  let pastTitle = false;
  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      pastTitle = true;
      continue;
    }
    if (!pastTitle) continue;
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('```')) continue;
    if (trimmed.startsWith('#')) continue;
    return trimmed.slice(0, 160);
  }
  return '';
}

function toStarlightPage({ slug, domain, sourcePath, readme, kind }) {
  const title = extractTitle(readme, slug);
  const description = extractDescription(readme);
  const editUrl = `${GITHUB}/${sourcePath}`;
  const body = readme
    .replace(/^#\s+.+\n+/, '')
    .trim()
    .replace(/^\s*##\s+/gm, '## ');

  return `---
title: ${escapeYaml(title)}
description: ${escapeYaml(description || `${kind} ${slug}`)}
domain: ${escapeYaml(domain)}
packageSlug: ${escapeYaml(slug)}
packageKind: ${escapeYaml(kind)}
sourceReadme: ${escapeYaml(sourcePath)}
---

> **Edit source:** [${sourcePath}](${editUrl}) — this page is synced by \`npm run docs:sync\`.

${body}
`;
}

async function listPackageDirs(baseDir) {
  const entries = await readdir(baseDir, { withFileTypes: true });
  const slugs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const readmePath = join(baseDir, entry.name, 'README.md');
    try {
      await readFile(readmePath);
      slugs.push(entry.name);
    } catch {
      // skip packages without README
    }
  }
  return slugs.sort();
}

async function syncKind({ kind, baseDir, outDir, domainMap, starlightPrefix }) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const slugs = await listPackageDirs(baseDir);
  const entries = [];

  for (const slug of slugs) {
    const fixedSource =
      kind === 'plugin'
        ? `packages/plugins/${slug}/README.md`
        : `packages/presets/${slug}/README.md`;
    const readme = await readFile(join(repoRoot, fixedSource), 'utf8');
    const domain = domainMap[slug] ?? 'Other';
    const page = toStarlightPage({
      slug,
      domain,
      sourcePath: fixedSource,
      readme,
      kind,
    });
    await writeFile(join(outDir, `${slug}.md`), page, 'utf8');

    entries.push({
      slug,
      kind,
      domain,
      packageReadme: fixedSource,
      starlightPage: `${starlightPrefix}/${slug}`,
      npmPackage: `@awesome-pushup-standards/${slug}`,
      publishedVia: 'both',
      lastSynced: new Date().toISOString(),
    });
  }

  return entries;
}

function groupByDomain(entries) {
  /** @type {Map<string, typeof entries>} */
  const map = new Map();
  for (const entry of entries) {
    const list = map.get(entry.domain) ?? [];
    list.push(entry);
    map.set(entry.domain, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.slug.localeCompare(b.slug));
  }
  return map;
}

function renderRegistryMarkdown(registry) {
  const lines = [
    '---',
    'title: Documentation registry',
    'description: Where each plugin and preset documents are authored and published.',
    '---',
    '',
    '# Documentation registry',
    '',
    'Auto-generated by `npm run docs:sync`. Tracks **where documentation lives** for each package.',
    '',
    '| Slug | Domain | Package README | Starlight page | npm package | Published via |',
    '| ---- | ------ | -------------- | -------------- | ----------- | ------------- |',
  ];

  for (const entry of registry.entries) {
    lines.push(
      `| \`${entry.slug}\` | ${entry.domain} | [README](${GITHUB}/${entry.packageReadme}) | [wiki](/${entry.starlightPage}/) | \`${entry.npmPackage}\` | ${entry.publishedVia} |`,
    );
  }

  lines.push(
    '',
    '## Policy',
    '',
    '- **Author** plugin/preset docs in `packages/*/README.md`.',
    '- **Run** `npm run docs:sync` (or `npm run docs:build`) to refresh Starlight pages.',
    '- **Published via** `both` = npm/GitHub package README + CI docs artifact (Starlight build).',
    '- New plugins must add a row here via sync and an entry in `doc-registry.json` domain map in `scripts/sync-docs-to-starlight.mjs`.',
    '- **Future (Deferred):** extend `docs-quality` plugin with audits that verify docs are generated and collected — `doc-registry.json` entry, Starlight page exists, README/sync consistency. See [Backlog — docs-quality wiki sync](/project/backlog/#deferred).',
    '',
  );

  return lines.join('\n');
}

function renderSidebar(pluginEntries, presetEntries) {
  const pluginGroups = groupByDomain(pluginEntries);
  const presetGroups = groupByDomain(presetEntries);

  const pluginSections = DOMAIN_ORDER.filter((d) => pluginGroups.has(d)).map((domain) => ({
    label: domain,
    items: pluginGroups.get(domain).map((e) => ({ slug: e.starlightPage })),
  }));

  const presetSections = DOMAIN_ORDER.filter((d) => presetGroups.has(d)).map((domain) => ({
    label: domain,
    items: presetGroups.get(domain).map((e) => ({ slug: e.starlightPage })),
  }));

  const file = `// Auto-generated by scripts/sync-docs-to-starlight.mjs — do not edit manually.
/** @type {import('@astrojs/starlight/types').StarlightUserConfig['sidebar']} */
export const pluginSidebarGroups = ${JSON.stringify(pluginSections, null, '\t')};

/** @type {import('@astrojs/starlight/types').StarlightUserConfig['sidebar']} */
export const presetSidebarGroups = ${JSON.stringify(presetSections, null, '\t')};
`;

  return file;
}

function parseAuditsFromTs(content) {
  /** @type {{ slug: string; title: string }[]} */
  const audits = [];
  const re = /\{\s*slug:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"]\s*\}/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    audits.push({ slug: match[1], title: match[2] });
  }
  return audits;
}

async function loadPluginAudits(slug) {
  const auditsPath = join(repoRoot, 'packages/plugins', slug, 'src/audits.ts');
  try {
    const content = await readFile(auditsPath, 'utf8');
    return parseAuditsFromTs(content);
  } catch {
    return [];
  }
}

function parsePresetImports(content) {
  /** @type {string[]} */
  const awesome = [];
  /** @type {string[]} */
  const official = [];

  for (const match of content.matchAll(/from '@awesome-pushup-standards\/([^']+)'/g)) {
    if (!awesome.includes(match[1])) awesome.push(match[1]);
  }

  for (const match of content.matchAll(/from '@code-pushup\/([^']+)'/g)) {
    const pkg = match[1];
    if (pkg === 'models') continue;
    const label = OFFICIAL_PLUGIN_LABELS[pkg] ?? pkg;
    if (!official.includes(label)) official.push(label);
  }

  awesome.sort();
  official.sort();
  return { awesome, official };
}

async function loadPresetComposition(slug) {
  const indexPath = join(repoRoot, 'packages/presets', slug, 'src/index.ts');
  const content = await readFile(indexPath, 'utf8');
  return parsePresetImports(content);
}

function formatConfigOptions(configOptions) {
  const entries = Object.entries(configOptions ?? {});
  if (entries.length === 0) return '—';
  return entries.map(([key, desc]) => `\`${key}\` — ${desc}`).join('; ');
}

function formatTools(tools) {
  if (!tools?.length) return '—';
  return tools.map((t) => `\`${t}\``).join(', ');
}

function formatRelatedPlugins(plugins) {
  return plugins
    .map((p) => {
      if (p.startsWith('@code-pushup/')) return p;
      if (PLUGIN_CATALOG_META[p]) {
        return `[\`${p}\`](/plugins/${p}/)`;
      }
      return `\`${p}\``;
    })
    .join(', ');
}

async function buildCatalogData(pluginEntries, presetEntries) {
  const pluginAudits = new Map();
  for (const entry of pluginEntries) {
    pluginAudits.set(entry.slug, await loadPluginAudits(entry.slug));
  }

  const presetComposition = new Map();
  for (const entry of presetEntries) {
    presetComposition.set(entry.slug, await loadPresetComposition(entry.slug));
  }

  return { pluginAudits, presetComposition };
}

async function renderPluginsCatalogMarkdown(pluginEntries, presetEntries) {
  const introPath = join(repoRoot, 'scripts/plugins-catalog.intro.md');
  const intro = await readFile(introPath, 'utf8');
  const { pluginAudits, presetComposition } = await buildCatalogData(pluginEntries, presetEntries);

  const lines = [
    '---',
    'title: Plugins catalog',
    'description: Human-readable overview of all plugins — what they detect, audits, configuration, stack detector mappings, and preset composition.',
    '---',
    '',
    intro.trim(),
    '',
    '---',
    '',
    '> **Auto-generated below** by `npm run docs:sync` — do not edit tables in this file; update `scripts/plugin-catalog-meta.mjs`, package `audits.ts`, or preset imports instead.',
    '',
    '## Plugin summary (auto-generated)',
    '',
    '| Domain | Plugin | Kind | Detects | External tools | Details |',
    '| ------ | ------ | ---- | ------- | -------------- | ------- |',
  ];

  const sortedPlugins = [...pluginEntries].sort((a, b) => {
    const domainCmp = a.domain.localeCompare(b.domain);
    if (domainCmp !== 0) return domainCmp;
    return a.slug.localeCompare(b.slug);
  });

  for (const entry of sortedPlugins) {
    const meta = PLUGIN_CATALOG_META[entry.slug] ?? {
      kind: 'heuristic',
      detects: extractDescription(await readFile(join(repoRoot, entry.packageReadme), 'utf8')),
      externalTools: [],
      configOptions: {},
    };
    lines.push(
      `| ${entry.domain} | [\`${entry.slug}\`](/plugins/${entry.slug}/) | ${meta.kind} | ${meta.detects} | ${formatTools(meta.externalTools)} | [Full docs](/plugins/${entry.slug}/) |`,
    );
  }

  lines.push('', '## Stack detector mappings (auto-generated)', '');

  for (const slug of ['python-stack-detector', 'ts-stack-detector']) {
    const meta = PLUGIN_CATALOG_META[slug];
    if (!meta?.suggests) continue;

    lines.push(`### \`${slug}\``, '');
    lines.push(
      '| Audit | Checks | Suggests tooling | Related plugins |',
      '| ----- | ------ | ---------------- | --------------- |',
    );

    for (const audit of pluginAudits.get(slug) ?? []) {
      const suggest = meta.suggests[audit.slug];
      if (!suggest) {
        lines.push(`| \`${audit.slug}\` | — | — | — |`);
        continue;
      }
      lines.push(
        `| \`${audit.slug}\` | ${suggest.checks} | ${suggest.tooling} | ${formatRelatedPlugins(suggest.relatedPlugins)} |`,
      );
    }
    lines.push('');
  }

  lines.push('## Plugins by domain (auto-generated)', '');

  const pluginGroups = groupByDomain(pluginEntries);
  for (const domain of DOMAIN_ORDER) {
    const group = pluginGroups.get(domain);
    if (!group) continue;

    lines.push(`### ${domain}`, '');

    for (const entry of group) {
      const meta = PLUGIN_CATALOG_META[entry.slug] ?? {
        kind: 'heuristic',
        detects: '',
        externalTools: [],
        configOptions: {},
      };
      const audits = pluginAudits.get(entry.slug) ?? [];

      lines.push(`#### [\`${entry.slug}\`](/plugins/${entry.slug}/)`, '');
      lines.push(`- **Kind:** ${meta.kind}`);
      lines.push(`- **Detects:** ${meta.detects || '—'}`);
      if (meta.externalTools?.length) {
        lines.push(`- **External tools:** ${formatTools(meta.externalTools)}`);
      }
      lines.push(`- **Configuration:** ${formatConfigOptions(meta.configOptions)}`);
      if (audits.length > 0) {
        lines.push('- **Audits:**', ...audits.map((a) => `  - \`${a.slug}\` — ${a.title}`));
      }
      lines.push('');
    }
  }

  lines.push('## Preset composition (auto-generated)', '');
  lines.push(
    '| Preset | Domain | @awesome-pushup-standards plugins | Official code-pushup plugins |',
    '| ------ | ------ | --------------------------------- | ---------------------------- |',
  );

  for (const entry of presetEntries) {
    const { awesome, official } = presetComposition.get(entry.slug) ?? {
      awesome: [],
      official: [],
    };
    const awesomeLinks = awesome.map((s) => `[\`${s}\`](/plugins/${s}/)`).join(', ');
    lines.push(
      `| [\`${entry.slug}\`](/presets/${entry.slug}/) | ${entry.domain} | ${awesomeLinks || '—'} | ${official.join(', ') || '—'} |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  const pluginEntries = await syncKind({
    kind: 'plugin',
    baseDir: join(repoRoot, 'packages/plugins'),
    outDir: pluginsOut,
    domainMap: PLUGIN_DOMAINS,
    starlightPrefix: 'plugins',
  });

  const presetEntries = await syncKind({
    kind: 'preset',
    baseDir: join(repoRoot, 'packages/presets'),
    outDir: presetsOut,
    domainMap: PRESET_DOMAINS,
    starlightPrefix: 'presets',
  });

  const registry = {
    generatedAt: new Date().toISOString(),
    entries: [...pluginEntries, ...presetEntries].sort((a, b) => a.slug.localeCompare(b.slug)),
  };

  await writeFile(
    join(docsRoot, 'doc-registry.json'),
    `${JSON.stringify(registry, null, 2)}\n`,
    'utf8',
  );

  await writeFile(
    join(contentRoot, 'reference/documentation-registry.md'),
    renderRegistryMarkdown(registry),
    'utf8',
  );

  await writeFile(
    join(docsRoot, 'sidebar.generated.mjs'),
    renderSidebar(pluginEntries, presetEntries),
    'utf8',
  );

  await writeFile(
    join(contentRoot, 'reference/plugins-catalog.md'),
    await renderPluginsCatalogMarkdown(pluginEntries, presetEntries),
    'utf8',
  );

  formatGeneratedDocs();

  console.info(
    `docs:sync — ${pluginEntries.length} plugins, ${presetEntries.length} presets → Starlight + plugins catalog`,
  );
}

function formatGeneratedDocs() {
  execSync(`npx prettier --write ${GENERATED_DOC_PATHS.join(' ')}`, {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
