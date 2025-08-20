import importAlias from '@limegrass/eslint-plugin-import-alias'
import { defineConfig } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

const eslintConfig = defineConfig([
    ...compat.extends('@navikt/teamsykmelding', 'next/core-web-vitals', 'next/typescript'),
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
                        {
                            pattern: '^src/features/ny-sykmelding-form/.+',
                            depth: 2,
                        },
                    ],
                },
            ],
        },
    },
])

export default eslintConfig
