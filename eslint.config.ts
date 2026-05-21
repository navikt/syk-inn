import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importAlias from '@limegrass/eslint-plugin-import-alias'
import { defineConfig } from 'eslint/config'
import tsmEslintReact from '@navikt/tsm-eslint-react'
import vitest from '@vitest/eslint-plugin'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tsmEslintReact,
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
                    isRelativeImportOverridesEnforced: true,
                    relativeImportOverrides: [
                        { path: 'src/components', depth: 1 },
                        { path: 'src/lib', depth: 1 },
                        { path: 'src/dev', depth: 1 },
                        { path: 'src/core', depth: 1 },
                        { path: 'src/features/ny-sykmelding-form', depth: 1 },
                        { path: 'src/features/ny-sykmelding-form/draft', depth: 2 },
                        { path: 'src/features/ny-sykmelding-form/summary', depth: 2 },
                        { path: 'src/features/ny-sykmelding-form/sections', depth: 2 },
                        { path: 'src/features/ny-sykmelding-form/variants', depth: 2 },
                        { path: 'src/features/fhir/dashboard', depth: 2 },
                        { path: 'src/features/actions', depth: 1 },
                        { path: 'src/features', depth: 0 },
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
    {
        files: ['src/**/*.test.ts', 'src/**/*.integration.ts'],
        plugins: { vitest },
        rules: {
            ...vitest.configs.recommended.rules,
        },
    },
])

export default eslintConfig
