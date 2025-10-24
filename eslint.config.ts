// @ts-expect-error Why no work
import nextVitals from 'eslint-config-next/core-web-vitals'
// @ts-expect-error Why no work
import nextTs from 'eslint-config-next/typescript'
import importAlias from '@limegrass/eslint-plugin-import-alias'
import { defineConfig } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    eslintPluginPrettierRecommended,
    {
        rules: {
            // Look at enabling this, but it crashes with some react-hook-form internals atm
            'react-hooks/refs': 'off',
            'no-console': 'warn',
            'import/no-extraneous-dependencies': 'error',
            'prettier/prettier': 'warn',
            'import/order': [
                'warn',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                    'newlines-between': 'always',
                },
            ],
            '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
            'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
        },
    },
    {
        files: ['e2e/**'],
        rules: { 'testing-library/prefer-screen-queries': 'off', 'testing-library/no-node-access': 'off' },
    },
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        plugins: { 'import-alias': importAlias },
        rules: {
            'import-alias/import-alias': [
                'error',
                {
                    relativeImportOverrides: [
                        { depth: 1, path: '.' },
                        { pattern: '^src/features/ny-sykmelding-form/.+', depth: 2 },
                    ],
                },
            ],
        },
    },
])

export default eslintConfig
