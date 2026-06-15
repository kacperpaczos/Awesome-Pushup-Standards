import type { Audit } from '@code-pushup/models';

export const audits: Audit[] = [
  { slug: 'react-version', title: 'React 19 or newer' },
  { slug: 'recommended-state-libs', title: 'TanStack Query or Zustand' },
  { slug: 'hooks-rules', title: 'eslint-plugin-react-hooks configured' },
  { slug: 'forms-validation', title: 'react-hook-form + zod' },
  {
    slug: 'bundle-size',
    title: 'Bundle size budget configured (informational)',
  },
  {
    slug: 'accessibility',
    title: 'Accessibility linting configured (informational)',
  },
];
