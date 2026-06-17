import { initCollectLog } from './collect-log.js';

export default async function globalSetup(): Promise<void> {
  const logPath = await initCollectLog();

  console.info(`E2E collect log → ${logPath}`);
}
