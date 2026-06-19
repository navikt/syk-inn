import config from '@navikt/tsm-oxfmt'
import { defineConfig } from 'oxfmt'

export default defineConfig({
    ...config,
    // Disable this until we can fix the oxfmt sort for typescript alias
    sortImports: undefined,
    ignorePatterns: ['src/features/ny-sykmelding-form/summary/rules/rule-texts.ts'],
})
