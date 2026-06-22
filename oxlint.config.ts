import { defineConfig } from 'oxlint'

export default defineConfig({
    plugins: ['nextjs', 'import', 'vitest', 'jsx-a11y', 'promise', 'typescript', 'react', 'react-perf', 'oxc', 'node'],
    jsPlugins: [{ name: 'import-alias', specifier: '@limegrass/eslint-plugin-import-alias' }],
    options: { typeCheck: true, typeAware: true },
    rules: {
        'react/rules-of-hooks': 'error',
        'no-console': 'warn',
        'no-unused-expressions': 'warn',
        'typescript/no-explicit-any': 'warn',
        'typescript/no-require-imports': 'warn',
        'typescript/explicit-function-return-type': ['warn', { allowExpressions: true }],
        'react/jsx-curly-brace-presence': 'warn',
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
            files: ['libs/*-mock/**/*.{ts,tsx}'],
            rules: {
                // TODO: Consider turning on
                'typescript/no-base-to-string': 'off',
            },
        },
    ],
})
