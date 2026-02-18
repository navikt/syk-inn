import { NextConfig } from 'next'
import createMDX from '@next/mdx'

const nextConfig: NextConfig = {
    output: 'standalone',
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    transpilePackages: ['@navikt/fhir-mock-server', '@navikt/helseid-mock-server'],
    serverExternalPackages: [
        '@navikt/next-logger',
        'next-logger',
        'pino',
        'pino-socket',
        '@whatwg-node',
        'prom-client',
    ],
    // NextJS module tracer weridly doesn't include this direct dependency of Pino
    outputFileTracingIncludes: {
        '/': ['real-require'],
    },
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
        globalNotFound: true,
    },
    images: { remotePatterns: [new URL('https://cdn.nav.no/**')] },
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
    productionBrowserSourceMaps: true,
}

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
})

export default withMDX(nextConfig)
