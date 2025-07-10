import type { KnipConfig } from 'knip'

const config: KnipConfig = {
    ignore: [
        'src/**/*.generated.ts',
        'codegen.ts',
        'libs/fhir-mock/buntry-point.ts',
        'next-logger.config.js',
        'postcss.config.mjs',
    ],
    ignoreDependencies: ['@navikt/ds-css', 'pino-pretty'],
}

export default config
