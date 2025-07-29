import type { KnipConfig } from 'knip'

const config: KnipConfig = {
    playwright: {
        config: 'playwright.config.ts',
        entry: ['e2e/**/*.@(spec|test).?(c|m)[jt]s?(x)'],
    },
    ignore: [
        'src/**/*.generated.ts',
        'codegen.ts',
        'libs/fhir-mock/buntry-point.ts',
        'next-logger.config.js',
        'postcss.config.mjs',
        'scripts/**',
    ],

    ignoreDependencies: ['@navikt/ds-css', 'pino-pretty', 'eslint-config-next'],
}

export default config
