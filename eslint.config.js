import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**']
  },
  ...neostandard({ noStyle: true }),
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }]
    }
  }
]

