/** @type {import('next').NextConfig} */
const nextConfig = {
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
    },
}

export default nextConfig
