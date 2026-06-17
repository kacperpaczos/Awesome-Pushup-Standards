#!/usr/bin/env node
/**
 * Run plugin E2E collects sequentially with per-fixture logs under e2e/plugin-*-e2e/logs/.
 *
 * Prefer npm scripts (no CLI flags):
 *   npm run e2e
 *   npm run e2e:rebuild
 *   npm run e2e:images
 *   npm run e2e -- python-quality
 */
import { spawnSync } from 'node:child_process';
import { readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const pluginSlug = process.argv[2] || undefined;

if (process.env.E2E_COLLECT_LOG === undefined) {
  process.env.E2E_COLLECT_LOG = '1';
}

function run(command, cmdArgs, label) {
  console.info(`\n▶ ${label}`);
  const result = spawnSync(command, cmdArgs, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const vitestArgs = [
  'vitest',
  'run',
  '--config',
  'vitest.e2e.config.ts',
  '--no-file-parallelism',
  '--maxWorkers=1',
];

if (pluginSlug) {
  vitestArgs.push(`e2e/plugin-${pluginSlug}-e2e/tests/collect.e2e.test.ts`);
}

run('npx', vitestArgs, pluginSlug ? `E2E plugin: ${pluginSlug}` : 'E2E all plugins (38 collects)');

async function listLogDirs() {
  const e2eDir = join(repoRoot, 'e2e');
  const entries = await readdir(e2eDir, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.endsWith('-e2e')) continue;
    for (const variant of ['good', 'bad']) {
      const logDir = join(e2eDir, entry.name, 'logs', variant);
      try {
        await stat(logDir);
        dirs.push(logDir.replace(`${repoRoot}/`, ''));
      } catch {
        // not run this session
      }
    }
  }
  return dirs;
}

const logDirs = await listLogDirs();

async function writeLogsIndex(dirs) {
  const entries = dirs.map((dir) => {
    const [, project = '_unknown', variant = 'unknown'] =
      dir.match(/^e2e\/(plugin-[^/]+-e2e)\/logs\/(good|bad)$/) ?? [];
    return {
      project,
      plugin: project.replace(/^plugin-/, '').replace(/-e2e$/, ''),
      variant,
      collectLog: `${dir}/collect.log`,
      stdoutLog: `${dir}/stdout.log`,
      stderrLog: `${dir}/stderr.log`,
      reportJson: `${dir}/report.json`,
      metaJson: `${dir}/meta.json`,
      artifactsDir: `${dir}/artifacts`,
    };
  });

  const indexPath = join(repoRoot, 'e2e', 'logs', 'index.json');
  await writeFile(
    indexPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalFixtures: entries.length,
        entries,
      },
      null,
      2,
    ),
  );
  return indexPath.replace(`${repoRoot}/`, '');
}

const indexPath = await writeLogsIndex(logDirs);

console.info('\n--- E2E logs (host-owned, under each test project) ---');
console.info(`Combined log: e2e/logs/latest.log`);
console.info(`Index JSON: ${indexPath}`);
if (logDirs.length) {
  console.info('Per fixture:');
  for (const dir of logDirs) {
    console.info(`  ${dir}/collect.log`);
  }
} else {
  console.info('(no per-fixture logs — was E2E_COLLECT_LOG=0 set?)');
}
