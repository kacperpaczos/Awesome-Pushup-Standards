import { stat } from 'node:fs/promises';

const REPORT_PATH_IN_LOGS =
  /\/e2e\/plugin-[^/]+-e2e\/logs\/(good|bad)\/\.code-pushup\/report\.json$/;
const REPORT_WRITE_ERRORS = /(Generated reports failed|EACCES)/i;
const MTIME_SKEW_MS = 1_000;

export type AssertCollectOptions = {
  fixtureRelPath: string;
  image: string;
  reportPath: string;
  startedAt: number;
  stdout: string;
  stderr: string;
};

export async function assertCollectResultIsFresh(options: AssertCollectOptions): Promise<void> {
  const normalizedReportPath = options.reportPath.replaceAll('\\', '/');
  if (!REPORT_PATH_IN_LOGS.test(normalizedReportPath)) {
    throw new Error(
      `Refusing stale report source for ${options.fixtureRelPath} (${options.image}). ` +
        `Expected report path under e2e/plugin-*/logs/*/.code-pushup/report.json, got: ${options.reportPath}`,
    );
  }

  const stream = `${options.stdout}\n${options.stderr}`;
  if (REPORT_WRITE_ERRORS.test(stream)) {
    throw new Error(
      `Collect reported report-write error for ${options.fixtureRelPath} (${options.image}). ` +
        `See logs for details.`,
    );
  }

  let reportStat;
  try {
    reportStat = await stat(options.reportPath);
  } catch {
    throw new Error(
      `Missing report.json after collect for ${options.fixtureRelPath} (${options.image}) at ${options.reportPath}`,
    );
  }

  if (reportStat.mtimeMs + MTIME_SKEW_MS < options.startedAt) {
    throw new Error(
      `Stale report.json detected for ${options.fixtureRelPath} (${options.image}). ` +
        `mtime=${reportStat.mtimeMs}, startedAt=${options.startedAt}`,
    );
  }
}
