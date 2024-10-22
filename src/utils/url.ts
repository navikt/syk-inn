import { bundledEnv } from '@utils/env'

export function getAbsoluteURL(): string {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'local':
            return 'http://localhost:3000'
        case 'demo':
            return 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        case 'dev-gcp':
            return 'https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        default:
            throw new Error(`Unknown runtime environment ${bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}`)
    }
}

/**
 * Only to be used when using non-next APIs that don't automatically prepend basepath
 */
export function pathWithBasePath(path: `/${string}`): string {
    return `${bundledEnv.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
}
