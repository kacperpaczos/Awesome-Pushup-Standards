import { afterEach, describe, expect, it } from 'vitest';
import type { Report } from '@code-pushup/models';
import { cleanupE2eFixtureReports } from './cleanup.js';
import { PLUGIN_CONTRACTS, type PluginContract, type PluginSlug } from './plugin-contracts.js';
import {
  assertAllAuditsMinScore,
  assertNoSkippedRequired,
  getAudit,
  getPluginReport,
} from './report.js';
import { runCollectInContainer } from './run-collect.js';

const FIXTURE_SUFFIX = '/mocks/fixtures';

export function pluginSlugFromFixture(fixtureRelPath: string): PluginSlug | undefined {
  const match = fixtureRelPath.match(/^e2e\/plugin-(?<slug>.+)-e2e\//);
  return match?.groups?.slug as PluginSlug | undefined;
}

export function fixtureRelPathForPlugin(pluginSlug: PluginSlug, variant: 'good' | 'bad'): string {
  return `e2e/plugin-${pluginSlug}-e2e${FIXTURE_SUFFIX}/${variant}`;
}

export function fixtureRootForPlugin(pluginSlug: PluginSlug): string {
  return `e2e/plugin-${pluginSlug}-e2e${FIXTURE_SUFFIX}`;
}

export function getPluginContract(pluginSlug: PluginSlug): PluginContract {
  return PLUGIN_CONTRACTS[pluginSlug];
}

export async function runPluginContractCollect(options: {
  pluginSlug: PluginSlug;
  variant: 'good' | 'bad';
  env?: Record<string, string>;
}) {
  const contract = getPluginContract(options.pluginSlug);
  return runCollectInContainer({
    fixtureRelPath: fixtureRelPathForPlugin(options.pluginSlug, options.variant),
    image: contract.image,
    pluginSlug: options.pluginSlug,
    env: options.env,
  });
}

export function assertGoodFixtureContract(report: Report, pluginSlug: PluginSlug): void {
  const contract = getPluginContract(pluginSlug);
  assertNoSkippedRequired(report, pluginSlug, contract.good.requiredAudits);
  assertAllAuditsMinScore(report, pluginSlug, contract.good.minScore, {
    skipInformational: true,
    skipUnavailable: true,
    excludeSlugs: contract.good.excludeSlugs,
  });
}

export function assertBadFixtureContract(report: Report, pluginSlug: PluginSlug): void {
  const contract = getPluginContract(pluginSlug);
  if (contract.bad.mode === 'all-skipped') {
    const plugin = getPluginReport(report, pluginSlug);
    expect(
      plugin.audits.every((audit) => (audit.displayValue ?? '').toLowerCase().includes('skipped')),
    ).toBe(true);
    return;
  }

  const audit = getAudit(report, pluginSlug, contract.bad.failingAudit);
  expect(audit.score).toBe(0);
  expect((audit.displayValue ?? '').toLowerCase()).not.toContain('skipped');
}

export function createStandardPluginE2eTests(pluginSlug: PluginSlug): void {
  const fixtureRoot = fixtureRootForPlugin(pluginSlug);

  describe(`${pluginSlug} e2e`, () => {
    afterEach(async () => {
      await cleanupE2eFixtureReports(fixtureRoot);
    });

    it('good fixture passes plugin audits', async () => {
      const { code, report } = await runPluginContractCollect({ pluginSlug, variant: 'good' });
      expect(code).toBe(0);
      assertGoodFixtureContract(report, pluginSlug);
    });

    it('bad fixture fails expected audit', async () => {
      const { code, report } = await runPluginContractCollect({ pluginSlug, variant: 'bad' });
      expect(code).toBe(0);
      assertBadFixtureContract(report, pluginSlug);
    });
  });
}
