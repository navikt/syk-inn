import { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    eslint: { ignoreDuringBuilds: true },
    serverExternalPackages: ['@navikt/next-logger', 'next-logger', 'pino', 'pino-roll'],
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
    },
    logging: {
        fetches: {
            fullUrl: true,
            hmrRefreshes: true,
        },
    },
    rewrites: async () => {
        return {
            beforeFiles: [
                {
                    source: '/fhir/:path*',
                    destination: '/fhir-secure/:path*',
                },
            ],
            afterFiles: [],
            fallback: [],
        }
    },
}

export default nextConfig
