import { NextConfig } from 'next'
import Sonda from 'sonda/next'

const withSondaAnalyzer = Sonda()

const nextConfig: NextConfig = {
    output: 'standalone',
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    eslint: { ignoreDuringBuilds: true },
    transpilePackages: ['@navikt/fhir-mock-server'],
    serverExternalPackages: ['@navikt/next-logger', 'next-logger', 'pino', 'pino-socket', '@whatwg-node'],
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
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

export default process.env.NODE_ENV === 'development' || process.env.TURBOPACK
    ? nextConfig
    : withSondaAnalyzer(nextConfig)
