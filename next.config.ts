import createMDX from '@next/mdx'
import { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    reactStrictMode: true,
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
        /**
         * This causes insane CPU and memory usage because of a several months old bug. :-)
         *
         * See: https://github.com/vercel/next.js/issues/91396
         */
        turbopackServerFastRefresh: false,
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
    options: {
        remarkPlugins: ['remark-gfm'],
        rehypePlugins: [],
    },
})

export default withMDX(nextConfig)
