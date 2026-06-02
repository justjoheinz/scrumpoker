import nextConfig from 'eslint-config-next'

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'e2e/**',
      'tests/**',
      '*.config.*',
    ],
  },
  ...nextConfig,
  {
    rules: {
      // Temporarily disable new React 19 strict rules
      // TODO: Refactor effects to follow React 19 best practices
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
]

export default eslintConfig
