export {
  appendCollectLogSection,
  collectLogPath,
  initCollectLog,
  shouldWriteCollectLog,
  type CollectLogSection,
} from './collect-log.js';
export {
  assertBadFixtureContract,
  assertGoodFixtureContract,
  createStandardPluginE2eTests,
  fixtureRelPathForPlugin,
  fixtureRootForPlugin,
  getPluginContract,
  pluginSlugFromFixture,
  runPluginContractCollect,
} from './contract-test.js';
export { fixtureLogDir, e2eProjectFromFixture } from './fixture-log-dir.js';
export { dockerUserFlag } from './docker-user.js';
export { findRepoRoot } from './find-repo-root.js';
export {
  E2E_IMAGES,
  E2E_DOCKER_PATH,
  dockerRuntimeEnv,
  isDockerAvailable,
  type E2eImage,
} from './docker.js';
export { cleanupE2eFixtureReports, shouldKeepE2eReports } from './cleanup.js';
export {
  assertAllAuditsMinScore,
  assertAudits,
  assertNoSkippedRequired,
  getAudit,
  getPluginReport,
  readReport,
  reportPathForFixture,
  reportPathForLogDir,
  type AuditExpectation,
} from './report.js';
export { PLUGIN_CONTRACTS, type PluginContract, type PluginSlug } from './plugin-contracts.js';
export { assertCollectResultIsFresh, type AssertCollectOptions } from './assert-collect.js';
export { runCollectInContainer, type RunCollectOptions } from './run-collect.js';
export {
  assertToolPreflightOk,
  runToolPreflightInContainer,
  type ToolPreflightResult,
  type ToolPreflightSpec,
} from './tool-preflight.js';
