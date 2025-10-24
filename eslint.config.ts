// @ts-expect-error Why no work
import nextVitals from 'eslint-config-next/core-web-vitals'
// @ts-expect-error Why no work
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
                    ],
                },
            ],
        },
    },
])

export default eslintConfig
