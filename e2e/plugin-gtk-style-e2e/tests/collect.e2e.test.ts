import { afterEach, describe, expect, it } from 'vitest';
import {
  assertAllAuditsMinScore,
  assertNoSkippedRequired,
  cleanupE2eFixtureReports,
  getAudit,
  PLUGIN_CONTRACTS,
  runCollectInContainer,
} from '@awesome-pushup/e2e-utils';

const PLUGIN = 'gtk-style';
const FIXTURE = 'e2e/plugin-gtk-style-e2e/mocks/fixtures';
const CONTRACT = PLUGIN_CONTRACTS[PLUGIN];
const IMAGE = CONTRACT.image;

describe('gtk-style e2e', () => {
  afterEach(async () => {
    await cleanupE2eFixtureReports(FIXTURE);
  });

  it('good fixture passes plugin audits', async () => {
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: `${FIXTURE}/good`,
      image: IMAGE,
    });
    expect(code).toBe(0);
    assertNoSkippedRequired(report, PLUGIN, CONTRACT.good.requiredAudits);
    assertAllAuditsMinScore(report, PLUGIN, CONTRACT.good.minScore, {
      skipInformational: true,
      skipUnavailable: true,
      excludeSlugs: CONTRACT.good.excludeSlugs,
    });
  });

  it('bad fixture fails expected audit', async () => {
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: `${FIXTURE}/bad`,
      image: IMAGE,
    });
    expect(code).toBe(0);
    if (CONTRACT.bad.mode !== 'failing-audit') {
      throw new Error(`Unexpected bad contract mode for ${PLUGIN}`);
    }
    const audit = getAudit(report, PLUGIN, CONTRACT.bad.failingAudit);
    expect(audit.score).toBe(0);
    expect((audit.displayValue ?? '').toLowerCase()).not.toContain('skipped');
  });
});
