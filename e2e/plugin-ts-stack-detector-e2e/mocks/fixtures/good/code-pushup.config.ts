import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import createPlugin from '@awesome-pushup-standards/ts-stack-detector';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'],
  },
  plugins: [await createPlugin({ packageJsonPath: join(rootDir, 'package.json') })],
};
