import { rm } from 'node:fs/promises';
import { join } from 'node:path';

export function shouldKeepE2eReports(): boolean {
  return process.env.E2E_KEEP_REPORTS === '1';
}

/** Remove `.code-pushup` from good/bad fixture dirs (canonical reports are under e2e logs). */
export async function cleanupE2eFixtureReports(
  fixtureRelPath: string,
  repoRoot = process.cwd(),
): Promise<void> {
  for (const variant of ['good', 'bad'] as const) {
    await rm(join(repoRoot, fixtureRelPath, variant, '.code-pushup'), {
      recursive: true,
      force: true,
    }).catch(() => {});
  }
}
