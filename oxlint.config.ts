import tsmBase from '@navikt/tsm-oxlint'
import tsmReact from '@navikt/tsm-oxlint/react'
import { defineConfig } from 'oxlint'

export default defineConfig({
    extends: [tsmBase, tsmReact],
    plugins: ['nextjs', 'vitest'],
    jsPlugins: [{ name: 'import-alias', specifier: '@limegrass/eslint-plugin-import-alias' }],
    options: { typeCheck: true, typeAware: true },
    rules: {
        // TODO: Consider turning on
        'typescript/no-misused-spread': 'off',
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
    overrides: [
        {
            files: ['src/**/*.tsx'],
            excludeFiles: ['src/app/**'],
            rules: {
                // No default export for React components
                'import/no-default-export': 'error',
            },
        },
        {
            files: ['libs/*-mock/**/*.{ts,tsx}'],
            rules: {
                // TODO: Consider turning on
                'typescript/no-base-to-string': 'off',
                'typescript/no-non-null-assertion': 'off',
            },
        },
        {
            files: ['**/*.{test,integration}.{ts,tsx}'],
            rules: {
                'typescript/no-non-null-assertion': 'off',
            },
        },
    ],
})
