import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  type AuditReport,
  type PluginReport,
  type Report,
  reportSchema,
} from '@code-pushup/models';
import { expect } from 'vitest';

export async function readReport(reportPath: string): Promise<Report> {
  const raw = await readFile(reportPath, 'utf8');
  return reportSchema.parse(JSON.parse(raw));
}

export function getPluginReport(report: Report, pluginSlug: string): PluginReport {
  const plugin = report.plugins.find((p) => p.slug === pluginSlug);
  expect(plugin, `plugin "${pluginSlug}" missing from report`).toBeDefined();
  return plugin!;
}

export function getAudit(report: Report, pluginSlug: string, auditSlug: string): AuditReport {
  const plugin = getPluginReport(report, pluginSlug);
  const audit = plugin.audits.find((a) => a.slug === auditSlug);
  expect(audit, `audit "${auditSlug}" missing from plugin "${pluginSlug}"`).toBeDefined();
  return audit!;
}

export type AuditExpectation = {
  slug: string;
  minScore?: number;
  maxScore?: number;
  score?: number;
  minIssues?: number;
};

export function assertAudits(
  report: Report,
  pluginSlug: string,
  expectations: AuditExpectation[],
): void {
  for (const exp of expectations) {
    const audit = getAudit(report, pluginSlug, exp.slug);
    if (exp.score !== undefined) {
      expect(audit.score).toBe(exp.score);
    }
    if (exp.minScore !== undefined) {
      expect(audit.score).toBeGreaterThanOrEqual(exp.minScore);
    }
    if (exp.maxScore !== undefined) {
      expect(audit.score).toBeLessThanOrEqual(exp.maxScore);
    }
    if (exp.minIssues !== undefined) {
      const count = audit.details?.issues?.length ?? 0;
      expect(count).toBeGreaterThanOrEqual(exp.minIssues);
    }
  }
}

export function assertAllAuditsMinScore(
  report: Report,
  pluginSlug: string,
  minScore: number,
  options?: {
    skipSkipped?: boolean;
    skipInformational?: boolean;
    skipUnavailable?: boolean;
    excludeSlugs?: string[];
  },
): void {
  const plugin = getPluginReport(report, pluginSlug);
  for (const audit of plugin.audits) {
    if (options?.excludeSlugs?.includes(audit.slug)) continue;
    const display = audit.displayValue?.toLowerCase() ?? '';
    if (options?.skipSkipped && display.includes('skipped')) continue;
    if (options?.skipInformational && display.includes('informational')) continue;
    if (options?.skipUnavailable && display.includes('unavailable')) continue;
    expect(audit.score).toBeGreaterThanOrEqual(minScore);
  }
}

export function assertNoSkippedRequired(
  report: Report,
  pluginSlug: string,
  requiredAuditSlugs: string[],
): void {
  const plugin = getPluginReport(report, pluginSlug);
  for (const slug of requiredAuditSlugs) {
    const audit = plugin.audits.find((item) => item.slug === slug);
    expect(audit, `required audit "${slug}" missing from plugin "${pluginSlug}"`).toBeDefined();
    const display = audit?.displayValue?.toLowerCase() ?? '';
    const looksSkipped =
      display.includes('skipped') ||
      display.includes('not found') ||
      display.includes('unavailable');
    expect(
      looksSkipped,
      `required audit "${slug}" for plugin "${pluginSlug}" was skipped/unavailable: ${audit?.displayValue ?? '(empty displayValue)'}`,
    ).toBe(false);
  }
}

export function reportPathForFixture(fixtureAbs: string): string {
  return join(fixtureAbs, '.code-pushup', 'report.json');
}

export function reportPathForLogDir(logDirAbs: string): string {
  return join(logDirAbs, '.code-pushup', 'report.json');
}
