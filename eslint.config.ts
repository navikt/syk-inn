import { defineConfig } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

const eslintConfig = defineConfig([
    ...compat.config({
        extends: ['@navikt/teamsykmelding', 'next'],
    }),
])

export default eslintConfig
