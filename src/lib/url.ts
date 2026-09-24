import { bundledEnv } from './env'

export function getAbsoluteURL(): string {
    switch (bundledEnv.runtimeEnv) {
        case 'e2e':
        case 'local':
            return 'http://localhost:3000'
        case 'demo':
            return 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        case 'dev-gcp':
            return 'https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        case 'prod-gcp':
            return 'https://nav.no/samarbeidspartner/sykmelding'
        default:
            throw new Error(`Unknown runtime environment ${bundledEnv.runtimeEnv as string}`)
    }
}

/**
 * Only to be used when using non-next APIs that don't automatically prepend basepath
 */
export function pathWithBasePath(path: `/${string}`): string {
    return `${bundledEnv.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
}
