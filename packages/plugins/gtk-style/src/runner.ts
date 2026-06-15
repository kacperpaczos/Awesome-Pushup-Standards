import type { AuditOutput, AuditOutputs, Issue, RunnerArgs } from '@code-pushup/models';
import { crawlFileSystem } from '@code-pushup/utils';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export type RunnerOptions = {
  rootDir?: string;
  sourceDir?: string;
};

const SAMPLE_LIMIT = 50;

async function readFiles(paths: string[]): Promise<{ path: string; content: string }[]> {
  const sample = paths.slice(0, SAMPLE_LIMIT);
  return Promise.all(sample.map(async (path) => ({ path, content: await readFile(path, 'utf8') })));
}

function gobjectMacrosAudit(
  cFiles: { path: string; content: string }[],
  allFiles: { path: string; content: string }[],
): AuditOutput {
  if (cFiles.length === 0) {
    return {
      slug: 'gobject-macros',
      value: 0,
      score: 1,
      displayValue: 'no C sources — skipped',
    };
  }

  const projectHasDeclare = allFiles.some(({ content }) =>
    /G_DECLARE_(FINAL|DERIVABLE)_TYPE/.test(content),
  );

  const issues: Issue[] = [];
  for (const { path, content } of cFiles) {
    const hasDefine = /G_DEFINE_TYPE_WITH_PRIVATE/.test(content);
    if (!hasDefine) {
      issues.push({
        message: 'use G_DEFINE_TYPE_WITH_PRIVATE in GObject .c implementations',
        severity: 'warning',
        source: { file: path, position: { startLine: 1 } },
      });
    }
  }

  if (!projectHasDeclare) {
    issues.push({
      message: 'use G_DECLARE_FINAL_TYPE or G_DECLARE_DERIVABLE_TYPE for GObject types',
      severity: 'warning',
      source: { file: cFiles[0]?.path ?? 'src', position: { startLine: 1 } },
    });
  }

  const compliant = issues.length === 0;
  return {
    slug: 'gobject-macros',
    value: issues.length,
    score: compliant ? 1 : 0,
    displayValue: compliant ? 'GObject macros present' : `${issues.length} file(s) missing macros`,
    details: compliant ? undefined : { issues },
  };
}

function availabilityAudit(files: { path: string; content: string }[]): AuditOutput {
  if (files.length === 0) {
    return {
      slug: 'availability-annotations',
      value: 0,
      score: 1,
      displayValue: 'no sources — skipped',
    };
  }

  const gdkFiles = files.filter(({ content }) => /GDK_|gtk_|g_object_/i.test(content));
  if (gdkFiles.length === 0) {
    return {
      slug: 'availability-annotations',
      value: 0,
      score: 1,
      displayValue: 'no GDK/GTK symbols — skipped',
    };
  }

  const issues: Issue[] = [];
  for (const { path, content } of gdkFiles) {
    if (!/GDK_AVAILABLE_IN_\d+_\d+/.test(content)) {
      issues.push({
        message: 'add GDK_AVAILABLE_IN_X_Y macros for versioned GTK/GDK APIs',
        severity: 'info',
        source: { file: path, position: { startLine: 1 } },
      });
    }
  }

  const compliant = issues.length === 0;
  return {
    slug: 'availability-annotations',
    value: issues.length,
    score: compliant ? 1 : 0,
    displayValue: compliant
      ? 'availability macros present'
      : `${issues.length} file(s) missing GDK_AVAILABLE_IN_*`,
    details: compliant ? undefined : { issues },
  };
}

function styleConsistencyAudit(files: { path: string; content: string }[]): AuditOutput {
  if (files.length === 0) {
    return {
      slug: 'style-consistency',
      value: 0,
      score: 1,
      displayValue: 'no sources — skipped',
    };
  }

  const issues: Issue[] = [];
  for (const { path, content } of files) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      if (/\s+$/.test(lines[i] ?? '')) {
        issues.push({
          message: 'remove trailing whitespace (GNOME style)',
          severity: 'warning',
          source: { file: path, position: { startLine: i + 1 } },
        });
        break;
      }
    }
  }

  const compliant = issues.length === 0;
  return {
    slug: 'style-consistency',
    value: issues.length,
    score: compliant ? 1 : 0,
    displayValue: compliant
      ? 'no trailing whitespace'
      : `${issues.length} file(s) with trailing space`,
    details: compliant ? undefined : { issues },
  };
}

export function createRunner(options: RunnerOptions = {}) {
  const rootDir = options.rootDir ?? '.';
  const sourceDir = options.sourceDir ?? 'src/';

  return async (_args: RunnerArgs): Promise<AuditOutputs> => {
    const scanRoot = join(rootDir, sourceDir);
    const allPaths = await crawlFileSystem({
      directory: scanRoot,
      pattern: /\.[ch]$/,
    });

    const cPaths = allPaths.filter((p) => p.endsWith('.c'));
    const [cFiles, allFiles] = await Promise.all([readFiles(cPaths), readFiles(allPaths)]);

    return [
      gobjectMacrosAudit(cFiles, allFiles),
      availabilityAudit(allFiles),
      styleConsistencyAudit(allFiles),
    ];
  };
}
