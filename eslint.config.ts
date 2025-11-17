import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importAlias from '@limegrass/eslint-plugin-import-alias'
import { defineConfig } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import tsmEslintReact from '@navikt/tsm-eslint-react'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tsmEslintReact,
    {
        extends: [eslintPluginPrettierRecommended],
        rules: { 'prettier/prettier': 'warn' },
    },
    {
        rules: {
            // Look at enabling this, but it crashes with some react-hook-form internals atm
            'react-hooks/refs': 'off',
        },
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
                        { pattern: '^src/features/fhir/dashboard/.+', depth: 2 },
                    ],
                },
            ],
        },
    },
    {
        files: ['e2e/**/*.ts'],
        rules: {
            'import/no-extraneous-dependencies': 'off',
        },
    },
])

export default eslintConfig
