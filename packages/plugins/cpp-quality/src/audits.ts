import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'clang-tidy-warnings', title: 'Clang-tidy warnings' },
  { slug: 'cppcheck-issues', title: 'Cppcheck issues' },
  { slug: 'format-violations', title: 'Clang-format violations' },
];
