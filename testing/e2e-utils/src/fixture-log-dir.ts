import { join } from 'node:path';

const FIXTURE_PATH = /^(?<project>e2e\/plugin-[^/]+-e2e)\/mocks\/fixtures\/(?<variant>good|bad)$/;

/** Per-test-project log dir: e2e/plugin-<slug>-e2e/logs/<good|bad>/ */
export function fixtureLogDir(fixtureRelPath: string, repoRoot: string): string {
  const match = fixtureRelPath.match(FIXTURE_PATH);
  if (!match?.groups) {
    return join(repoRoot, 'e2e/logs/_unknown', fixtureRelPath.replaceAll('/', '_'));
  }
  return join(repoRoot, match.groups.project, 'logs', match.groups.variant);
}

export function e2eProjectFromFixture(fixtureRelPath: string): string | undefined {
  return fixtureRelPath.match(FIXTURE_PATH)?.groups?.project;
}
