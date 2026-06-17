import { appendFile, copyFile, cp, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { Report } from '@code-pushup/models';
import { findRepoRoot } from './find-repo-root.js';
import { fixtureLogDir } from './fixture-log-dir.js';

const DIR_MODE = 0o755;
const FILE_MODE = 0o644;

const LOGS_GITIGNORE = `# E2E collect output (host-owned copies from Docker)
*
!.gitignore
`;

export type CollectLogSection = {
  index: number;
  fixtureRelPath: string;
  image: string;
  command: string;
  usedDocker: boolean;
  exitCode: number | null;
  signal: string | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  reportPath: string;
  report: Report;
};

export function shouldWriteCollectLog(): boolean {
  return process.env.E2E_COLLECT_LOG !== '0';
}

export function collectLogPath(repoRoot = findRepoRoot()): string {
  return join(repoRoot, 'e2e/logs/latest.log');
}

let sectionIndex = 0;

export function nextCollectLogIndex(): number {
  sectionIndex += 1;
  return sectionIndex;
}

async function ensureLogsDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true, mode: DIR_MODE });
  const gitignorePath = join(dir, '.gitignore');
  try {
    await stat(gitignorePath);
  } catch {
    await writeFile(gitignorePath, LOGS_GITIGNORE, { mode: FILE_MODE });
  }
}

export async function initCollectLog(repoRoot = findRepoRoot()): Promise<string> {
  sectionIndex = 0;
  const logsRoot = join(repoRoot, 'e2e/logs');
  await ensureLogsDir(logsRoot);

  const logPath = collectLogPath(repoRoot);
  const header = [
    'E2E code-pushup collect log',
    `started: ${new Date().toISOString()}`,
    `repo: ${repoRoot}`,
    '',
    'Combined log. Per-test copies: e2e/plugin-*-e2e/logs/<good|bad>/',
    '',
  ].join('\n');
  await writeFile(logPath, header, { mode: FILE_MODE });
  process.env.E2E_COLLECT_LOG_FILE = logPath;
  return logPath;
}

function formatSectionBody(section: CollectLogSection): string {
  const divider = '='.repeat(80);
  return [
    divider,
    `[${section.index}] collect`,
    `fixture: ${section.fixtureRelPath}`,
    `image: ${section.image}`,
    `docker: ${section.usedDocker ? 'yes' : 'no (host)'}`,
    `duration: ${section.durationMs}ms`,
    `exit code: ${section.exitCode ?? 'null'}${section.signal ? ` (signal ${section.signal})` : ''}`,
    `report: ${section.reportPath}`,
    '',
    '--- command ---',
    section.command,
    '',
    '--- stdout ---',
    section.stdout.trim() || '(empty)',
    '',
    '--- stderr ---',
    section.stderr.trim() || '(empty)',
    '',
    formatReportSummary(section.report),
    '',
  ].join('\n');
}

function formatReportSummary(report: Report): string {
  const lines: string[] = ['--- report summary ---'];

  for (const plugin of report.plugins) {
    lines.push(`plugin: ${plugin.slug}`);
    if (plugin.title) lines.push(`  title: ${plugin.title}`);
    if (plugin.packageName) lines.push(`  package: ${plugin.packageName}`);
    if (plugin.description) lines.push(`  description: ${plugin.description}`);

    for (const audit of plugin.audits) {
      const issues = audit.details?.issues?.length ?? 0;
      lines.push(
        `  audit: ${audit.slug} | score=${audit.score} | ${audit.displayValue}${issues > 0 ? ` | issues=${issues}` : ''}`,
      );
      if (audit.details?.issues?.length) {
        for (const issue of audit.details.issues.slice(0, 5)) {
          lines.push(`    - [${issue.severity ?? 'info'}] ${issue.message}`);
        }
        if (audit.details.issues.length > 5) {
          lines.push(`    - … +${audit.details.issues.length - 5} more`);
        }
      }
    }
    lines.push('');
  }

  lines.push('--- report.json (full) ---');
  lines.push(JSON.stringify(report, null, 2));
  return lines.join('\n');
}

/** Copy persist output files into per-test logs dir. */
async function copyPersistArtifacts(persistDir: string, logDir: string): Promise<string[]> {
  const artifactsDir = join(logDir, 'artifacts');
  const copied: string[] = [];

  try {
    await stat(persistDir);
  } catch {
    return copied;
  }

  await mkdir(artifactsDir, { recursive: true, mode: DIR_MODE });

  const entries = await readdir(persistDir, { withFileTypes: true });
  for (const entry of entries) {
    const src = join(persistDir, entry.name);
    const dest = join(artifactsDir, entry.name);
    if (entry.isDirectory()) {
      await cp(src, dest, { recursive: true, force: true });
    } else {
      await copyFile(src, dest);
    }
    copied.push(dest);
  }

  return copied;
}

async function writePerFixtureLogs(section: CollectLogSection, repoRoot: string): Promise<string> {
  const logDir = fixtureLogDir(section.fixtureRelPath, repoRoot);
  const persistDir = dirname(section.reportPath);
  await ensureLogsDir(logDir);

  const body = formatSectionBody(section);
  await writeFile(join(logDir, 'collect.log'), body, { mode: FILE_MODE });
  await writeFile(join(logDir, 'stdout.log'), section.stdout, { mode: FILE_MODE });
  await writeFile(join(logDir, 'stderr.log'), section.stderr, { mode: FILE_MODE });
  await writeFile(join(logDir, 'report.json'), JSON.stringify(section.report, null, 2), {
    mode: FILE_MODE,
  });

  const artifacts = await copyPersistArtifacts(persistDir, logDir);

  const reportMdSrc = join(persistDir, 'report.md');
  try {
    await copyFile(reportMdSrc, join(logDir, 'report.md'));
  } catch {
    // optional
  }

  await writeFile(
    join(logDir, 'meta.json'),
    JSON.stringify(
      {
        index: section.index,
        fixture: section.fixtureRelPath,
        image: section.image,
        docker: section.usedDocker,
        exitCode: section.exitCode,
        signal: section.signal,
        durationMs: section.durationMs,
        command: section.command,
        reportPath: section.reportPath,
        artifactFiles: artifacts.map((p) => p.replace(`${repoRoot}/`, '')),
        copiedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    { mode: FILE_MODE },
  );

  return logDir;
}

export async function appendCollectLogSection(section: CollectLogSection): Promise<void> {
  if (!shouldWriteCollectLog()) return;

  const repoRoot = findRepoRoot();
  const logPath = process.env.E2E_COLLECT_LOG_FILE ?? collectLogPath(repoRoot);
  await appendFile(logPath, formatSectionBody(section), { mode: FILE_MODE });
  await writePerFixtureLogs(section, repoRoot);
}
