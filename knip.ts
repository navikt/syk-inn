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
        'libs/helseid-mock/buntry-point.ts',
        'next-logger.config.cjs',
        'postcss.config.mjs',
    ],
    ignoreDependencies: ['@opentelemetry/core'],
}

export default config
