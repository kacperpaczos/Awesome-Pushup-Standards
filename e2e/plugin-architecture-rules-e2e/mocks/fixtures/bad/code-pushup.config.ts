import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import createPlugin from '@awesome-pushup-standards/architecture-rules';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'],
  },
  plugins: [await createPlugin({ rootDir })],
};
