import { defineConfig } from 'oxlint'

export default defineConfig({
    plugins: ['nextjs', 'import', 'vitest', 'jsx-a11y', 'promise', 'typescript', 'react', 'oxc', 'node'],
    options: { typeCheck: true, typeAware: true },
    rules: {
        'typescript/no-misused-spread': 'off',
    },
    overrides: [
        {
            files: ['libs/*-mock/**/*.{ts,tsx}'],
            rules: {
                'typescript/no-base-to-string': 'off',
            },
        },
    ],
})
