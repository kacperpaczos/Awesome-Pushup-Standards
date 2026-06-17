#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const REPO = new URL('..', import.meta.url).pathname;

const OPTION_TEMPLATES = {
  rootDir: '({ rootDir })',
  cwd: '({ cwd: rootDir })',
  pyproject: '({ pyprojectPath: join(rootDir, "pyproject.toml") })',
  packageJson: '({ packageJsonPath: join(rootDir, "package.json") })',
  llm: '({ rootDir, sourceDir: "src" })',
};

/** @type {Array<{ slug: string; image: string; options: keyof typeof OPTION_TEMPLATES; badAudit: string; goodExcludeAudits?: string[]; good: Record<string, string>; bad: Record<string, string> }>} */
const PLUGINS = [
  {
    slug: 'docs-quality',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'readme-completeness',
    good: {
      'README.md': '# Demo\n\n## Install\n\n## Usage\n\n',
      'CHANGELOG.md': '# Changelog\n',
      LICENSE: 'MIT',
      'CONTRIBUTING.md': '# Contributing\n',
    },
    bad: {},
  },
  {
    slug: 'cicd-quality',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'ci-present',
    good: {
      '.github/workflows/ci.yml':
        'permissions:\n  contents: read\njobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, windows-latest, macos-latest]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: nrwl/nx-set-shas@v4\n      - run: npx nx affected -t test\n',
      '.github/workflows/code-pushup-fork.yml':
        'permissions:\n  contents: read\non:\n  pull_request_target:\n# fork PRs no secrets\n',
      '.github/workflows/dependency-review.yml':
        'permissions:\n  contents: read\nuses: dependency-review-action@v4\n',
      '.github/workflows/release.yml':
        'permissions:\n  contents: write\nconcurrency:\n  cancel-in-progress: false\n',
    },
    bad: {},
  },
  {
    slug: 'contributor-hygiene',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'pre-commit-hooks',
    good: {
      'commitlint.config.js': 'export default { extends: ["@commitlint/config-conventional"] };\n',
      '.husky/pre-commit': '#!/bin/sh\nnpm test\n',
      '.husky/commit-msg': '#!/bin/sh\nnpx commitlint --edit $1\n',
      'package.json':
        '{"scripts":{"commit":"git-cz"},"config":{"commitizen":{"path":"@commitlint/cz-commitlint"}},"devDependencies":{"knip":"^5.0.0"}}',
      '.editorconfig': 'root = true\n',
      '.prettierrc': '{}',
      'knip.config.ts': 'export default {};\n',
      '.env.example': 'PUSHUP_LLM_ENDPOINT=\n',
    },
    bad: {
      'commitlint.config.js': 'export default { extends: ["@commitlint/config-conventional"] };\n',
    },
  },
  {
    slug: 'release-quality',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'security-policy',
    good: {
      'SECURITY.md': '# Security\n',
      '.github/workflows/publish.yml':
        'permissions:\n  id-token: write\njobs:\n  publish:\n    environment: release\n',
      '.github/workflows/release.yml': 'jobs:\n  release:\n    permissions:\n      contents: write\n',
      '.github/workflows/pr-commitlint.yml': 'on:\n  pull_request:\n',
      '.github/workflows/ci.yml': 'jobs:\n  preview:\n    steps:\n      - run: npx pkg-pr-new publish\n',
    },
    bad: {},
  },
  {
    slug: 'ts-stack-detector',
    image: 'e2e-node:20',
    options: 'packageJson',
    badAudit: 'suggest-typescript',
    good: {
      'package.json':
        '{"devDependencies":{"typescript":"^5.6.0","eslint":"^9.0.0","zod":"^3.23.0"},"scripts":{"lint":"eslint ."}}',
      'eslint.config.js': 'export default [];\n',
    },
    bad: {
      'package.json': '{"name":"plain-js"}',
    },
  },
  {
    slug: 'python-stack-detector',
    image: 'e2e-python:3.12',
    options: 'pyproject',
    badAudit: 'has-ruff',
    good: {
      'pyproject.toml':
        '[project]\ndependencies = ["pydantic"]\n\n[tool.ruff]\nline-length = 88\n\n[tool.mypy]\nstrict = true\n\n[tool.bandit]\n\n[tool.pip-audit]\n',
    },
    bad: {
      'pyproject.toml': '[project]\ndependencies = ["pydantic"]\n',
    },
  },
  {
    slug: 'react-standards',
    image: 'e2e-node:20',
    options: 'packageJson',
    badAudit: 'react-version',
    good: {
      'package.json':
        '{"dependencies":{"react":"^19.0.0","react-dom":"^19.0.0","@tanstack/react-query":"^5.0.0","react-hook-form":"^7.0.0","zod":"^3.23.0"},"devDependencies":{"eslint-plugin-react-hooks":"^5.0.0","eslint-plugin-jsx-a11y":"^6.10.0"},"bundlesize":[{"path":"./dist/*.js","maxSize":"100kb"}]}',
      'eslint.config.js': 'export default [];\n',
      'vite.config.ts': 'export default { build: { chunkSizeWarningLimit: 500 } };\n',
    },
    bad: {
      'package.json': '{"dependencies":{"vue":"^3.0.0"}}',
    },
  },
  {
    slug: 'docker-quality',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'multi-stage-build',
    good: {
      Dockerfile:
        'FROM node:20-bookworm AS deps\nWORKDIR /app\nCOPY package.json .\nRUN npm ci\n\nFROM node:20-bookworm\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nCMD ["node", "index.js"]\n',
      '.github/workflows/ci.yml': 'jobs:\n  scan:\n    steps:\n      - run: trivy image app:latest\n',
    },
    bad: {
      Dockerfile: 'FROM node:20-bookworm\nWORKDIR /app\nCOPY . .\nCMD ["node", "index.js"]\n',
    },
  },
  {
    slug: 'python-quality',
    image: 'e2e-python:3.12',
    options: 'cwd',
    badAudit: 'ruff-lint',
    goodExcludeAudits: ['line-coverage', 'dependency-vulnerabilities'],
    good: {
      'pyproject.toml':
        '[project]\nname = "demo"\n\n[tool.bandit]\nskips = ["B101"]\n',
      'demo.py': 'def add(a: int, b: int) -> int:\n    return a + b\n',
      'test_demo.py': 'from demo import add\n\ndef test_add():\n    if add(1, 2) != 3:\n        raise AssertionError("expected 3")\n',
    },
    bad: {
      'pyproject.toml': '[project]\nname = "demo"\n',
      'demo.py': 'import os\n\ndef bad( ):\n    x=1+2\n',
    },
  },
  {
    slug: 'rust-quality',
    image: 'e2e-rust:1.83',
    options: 'cwd',
    badAudit: 'clippy-warnings',
    goodExcludeAudits: ['coverage', 'advisory-vulnerabilities'],
    good: {
      'Cargo.toml': '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\n',
      'src/main.rs': 'fn main() {\n    println!("hello");\n}\n',
    },
    bad: {
      'Cargo.toml': '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\n',
      'src/main.rs': '#![deny(unused_variables)]\n\nfn main() {\n    let unused = 1;\n}\n',
    },
  },
  {
    slug: 'rust-modules',
    image: 'e2e-rust:1.83',
    options: 'rootDir',
    badAudit: 'banned-dependencies',
    good: {
      'deny.toml':
        '[advisories]\nignore = []\n\n[licenses]\nallow = ["MIT", "Apache-2.0", "Unicode-3.0"]\nconfidence-threshold = 0.8\n',
      'Cargo.toml':
        '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\nlicense = "MIT"\n\n[dependencies]\nserde = "1"\n',
      'src/main.rs': 'mod app;\nmod helpers;\n\nfn main() {\n    app::run();\n}\n',
      'src/app.rs': 'use crate::helpers;\n\npub fn run() {\n    helpers::greet();\n}\n',
      'src/helpers.rs': 'pub fn greet() {}\n',
    },
    bad: {
      'Cargo.toml': '[package]\nname = "demo"\nversion = "0.1.0"\nedition = "2021"\n',
      'src/main.rs': 'fn main() {}\n',
    },
  },
  {
    slug: 'cpp-quality',
    image: 'e2e-cpp:qt',
    options: 'cwd',
    badAudit: 'format-violations',
    good: {
      'main.cpp': 'int main() { return 0; }\n',
    },
    bad: {
      'main.cpp': 'int main(){return 0;}\n',
    },
  },
  {
    slug: 'qt-quality',
    image: 'e2e-cpp:qt',
    options: 'rootDir',
    badAudit: 'qt-api-misuse',
    good: {
      'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.16)\nproject(demo)\nfind_package(Qt6 REQUIRED)\n',
      '.clang-tidy': 'Checks: "-*,qt-*"\n',
      'main.cpp': '#include <QtCore>\n',
    },
    bad: {
      'CMakeLists.txt': 'cmake_minimum_required(VERSION 3.16)\nproject(demo)\nfind_package(Qt6 REQUIRED)\n',
      'main.cpp': '#include <QtCore>\n',
    },
  },
  {
    slug: 'gtk-style',
    image: 'e2e-gtk:c',
    options: 'rootDir',
    badAudit: 'gobject-macros',
    good: {
      'src/widget.c':
        '#include <glib-object.h>\nG_DEFINE_TYPE_WITH_PRIVATE(Foo, foo, G_TYPE_OBJECT)\n',
      'src/widget.h': 'G_DECLARE_FINAL_TYPE(Foo, foo, FOO, foo, GObject)\n',
    },
    bad: {
      'src/widget.c': 'void foo(void) {}\n',
    },
  },
  {
    slug: 'architecture-rules',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'forbidden-imports',
    good: {
      '.dependency-cruiser.js':
        'module.exports = { forbidden: [{ name: "no-cycles" }], allowed: [], options: { layer: true } };\n',
    },
    bad: {},
  },
  {
    slug: 'api-openapi',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'api-versioning',
    good: {
      'openapi.yaml':
        'openapi: 3.1.0\ninfo:\n  title: Demo\n  version: 1.0.0\npaths:\n  /v1/items:\n    get:\n      responses:\n        "200":\n          description: ok\n',
      '.spectral.yaml': 'extends: ["spectral:oas"]\n',
    },
    bad: {
      'openapi.yaml': 'openapi: 3.1.0\ninfo:\n  title: Demo\npaths: {}\n',
      '.spectral.yaml': 'extends: ["spectral:oas"]\n',
    },
  },
  {
    slug: 'error-logging',
    image: 'e2e-node:20',
    options: 'rootDir',
    badAudit: 'bare-except',
    good: {
      'app.py': 'import logging\nlogger = logging.getLogger(__name__)\n\ndef run():\n    try:\n        pass\n    except ValueError as exc:\n        logger.exception("failed", exc_info=exc)\n',
    },
    bad: {
      'app.py': 'def run():\n    try:\n        pass\n    except:\n        pass\n',
    },
  },
  {
    slug: 'security-sast',
    image: 'e2e-security',
    options: 'rootDir',
    badAudit: 'secrets-detected',
    good: {
      '.gitleaks.toml': 'title = "demo"\n',
      '.github/workflows/ci.yml':
        'jobs:\n  sast:\n    steps:\n      - run: bandit -r .\n  sbom:\n    steps:\n      - run: syft packages dir:./\n',
      'pyproject.toml': '[project]\nname = "demo"\n\n[tool.bandit]\n',
    },
    bad: {
      'pyproject.toml': '[project]\nname = "demo"\n',
    },
  },
  {
    slug: 'llm-review',
    image: 'e2e-node:20',
    options: 'llm',
    badAudit: 'architecture-review',
    good: {
      'src/sample.ts': 'export function greet(name: string): string {\n  return `Hello, ${name}`;\n}\n',
    },
    bad: {
      'src/sample.ts': 'export function greet(name: string): string {\n  return `Hello, ${name}`;\n}\n',
    },
  },
];

function configTs(slug, optionsKey) {
  const pkg = `@awesome-pushup-standards/${slug}`;
  const opts = OPTION_TEMPLATES[optionsKey];
  return `import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import createPlugin from '${pkg}';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default {
  persist: {
    outputDir: '.code-pushup',
    filename: 'report',
    format: ['json'],
  },
  plugins: [await createPlugin(${opts})],
};
`;
}

function testTs(slug, image, badAudit, isLlm = false, goodExcludeAudits = []) {
  const excludeLiteral = JSON.stringify(goodExcludeAudits);
  const project = `plugin-${slug}-e2e`;
  const base = `e2e/${project}/mocks/fixtures`;

  if (isLlm) {
    return `import { createServer, type Server } from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  assertAllAuditsMinScore,
  assertAudits,
  cleanupE2eFixtureReports,
  runCollectInContainer,
} from '@awesome-pushup/e2e-utils';

const PLUGIN = '${slug}';
const FIXTURE = '${base}';
const IMAGE = '${image}';

describe('${slug} e2e', () => {
  let server: Server;
  let endpoint = '';

  beforeAll(async () => {
    server = createServer((_req, res) => {
      const body = JSON.stringify({
        dimensions: [
          { name: 'architecture', score: 5, justification: 'layering ok' },
          { name: 'naming', score: 5, justification: 'clear names' },
          { name: 'consistency', score: 5, justification: 'consistent style' },
          { name: 'modern-alternatives', score: 5, justification: 'modern APIs' },
          { name: 'readability', score: 5, justification: 'readable code' },
        ],
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          choices: [{ message: { content: body } }],
        }),
      );
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      endpoint = \`http://127.0.0.1:\${addr.port}/v1/chat/completions\`;
      process.env.PUSHUP_LLM_ENDPOINT = endpoint;
      process.env.PUSHUP_LLM_MODEL = 'mock';
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    delete process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_MODEL;
  });

  afterEach(async () => {
    await cleanupE2eFixtureReports(FIXTURE);
  });

  it('good fixture returns LLM scores', async () => {
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: \`\${FIXTURE}/good\`,
      image: IMAGE,
      env: { PUSHUP_LLM_ENDPOINT: endpoint, PUSHUP_LLM_MODEL: 'mock' },
    });
    expect(code).toBe(0);
    assertAllAuditsMinScore(report, PLUGIN, 0.9, {
      skipSkipped: true,
      skipInformational: true,
      skipUnavailable: true,
      excludeSlugs: ${excludeLiteral},
    });
  });

  it('bad fixture skips without endpoint', async () => {
    const prev = process.env.PUSHUP_LLM_ENDPOINT;
    delete process.env.PUSHUP_LLM_ENDPOINT;
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: \`\${FIXTURE}/bad\`,
      image: IMAGE,
    });
    if (prev) process.env.PUSHUP_LLM_ENDPOINT = prev;
    expect(code).toBe(0);
    const plugin = report.plugins.find((p) => p.slug === PLUGIN);
    expect(plugin?.audits.every((a) => a.displayValue?.includes('skipped'))).toBe(true);
  });
});
`;
  }

  return `import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertAllAuditsMinScore,
  assertAudits,
  cleanupE2eFixtureReports,
  runCollectInContainer,
} from '@awesome-pushup/e2e-utils';

const PLUGIN = '${slug}';
const FIXTURE = '${base}';
const IMAGE = '${image}';

describe('${slug} e2e', () => {
  afterEach(async () => {
    await cleanupE2eFixtureReports(FIXTURE);
  });

  it('good fixture passes plugin audits', async () => {
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: \`\${FIXTURE}/good\`,
      image: IMAGE,
    });
    expect(code).toBe(0);
    assertAllAuditsMinScore(report, PLUGIN, 0.9, {
      skipSkipped: true,
      skipInformational: true,
      skipUnavailable: true,
      excludeSlugs: ${excludeLiteral},
    });
  });

  it('bad fixture fails expected audit', async () => {
    const { code, report } = await runCollectInContainer({
      fixtureRelPath: \`\${FIXTURE}/bad\`,
      image: IMAGE,
    });
    expect(code).toBe(0);
    const plugin = report.plugins.find((p) => p.slug === PLUGIN);
    const audit = plugin?.audits.find((a) => a.slug === '${badAudit}');
    expect(audit).toBeDefined();
    if ((audit?.displayValue ?? '').toLowerCase().includes('skipped')) {
      expect(plugin?.audits.some((a) => a.score === 0)).toBe(true);
    } else {
      expect(audit?.score).toBe(0);
    }
  });
});
`;
}

function projectJson(slug) {
  const name = `plugin-${slug}-e2e`;
  return {
    name,
    $schema: '../../node_modules/nx/schemas/project-schema.json',
    sourceRoot: `e2e/${name}`,
    projectType: 'application',
    implicitDependencies: [slug],
    tags: ['scope:plugin', 'type:e2e'],
    targets: {
      e2e: {
        executor: 'nx:run-commands',
        dependsOn: ['^build'],
        options: {
          command: 'vitest run --config vitest.e2e.config.ts',
          cwd: `{workspaceRoot}`,
        },
      },
    },
  };
}

async function writeTree(base, files) {
  for (const [rel, content] of Object.entries(files)) {
    const full = join(base, rel);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(full, content);
  }
}

for (const plugin of PLUGINS) {
  const project = `plugin-${plugin.slug}-e2e`;
  const root = join(REPO, 'e2e', project);

  await mkdir(join(root, 'mocks/fixtures/good'), { recursive: true });
  await mkdir(join(root, 'mocks/fixtures/bad'), { recursive: true });
  await mkdir(join(root, 'tests'), { recursive: true });

  const config = configTs(plugin.slug, plugin.options);
  await writeTree(join(root, 'mocks/fixtures/good'), {
    'code-pushup.config.ts': config,
    ...plugin.good,
  });
  await writeTree(join(root, 'mocks/fixtures/bad'), {
    'code-pushup.config.ts': config,
    ...plugin.bad,
  });

  await writeFile(
    join(root, 'tests/collect.e2e.test.ts'),
    testTs(
      plugin.slug,
      plugin.image,
      plugin.badAudit,
      plugin.slug === 'llm-review',
      plugin.goodExcludeAudits ?? [],
    ),
  );
  await writeFile(join(root, 'project.json'), `${JSON.stringify(projectJson(plugin.slug), null, 2)}\n`);
  await writeFile(
    join(root, 'vitest.e2e.config.ts'),
    `import rootConfig from '../../vitest.e2e.config.js';\nexport default rootConfig;\n`,
  );

  console.log(`scaffolded ${project}`);
}

console.log(`Done: ${PLUGINS.length} e2e projects`);
