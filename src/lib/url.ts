import { BundledEnv, bundledEnv } from './env'
import { raise } from './ts'

export function getAbsoluteURL(): string {
    switch (bundledEnv.runtimeEnv) {
        case 'e2e':
        case 'local':
            return 'http://localhost:3000'
        case 'demo':
            return 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        case 'dev-gcp':
            return 'https://www.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        default:
            throw new Error(`Unknown runtime environment ${bundledEnv.runtimeEnv}`)
    }
}

const legalLoopbackEnvs = ['local', 'e2e', 'demo'] satisfies Array<BundledEnv['runtimeEnv']> as string[]

/**
 * Used to fetch 'self', should only be used in demo, e2e and local environments
 */
export function getLoopbackURL(): string {
    if (!legalLoopbackEnvs.includes(bundledEnv.runtimeEnv)) {
        raise(`Trying to use loopback URL in env ${bundledEnv.runtimeEnv}, this is illegal!!`)
    }

    switch (bundledEnv.runtimeEnv) {
        case 'e2e':
            return `http://${process.env.HOSTNAME ?? '0.0.0.0'}:${process.env.PORT ?? '3000'}`
        case 'demo':
            return `http://0.0.0.0:${process.env.PORT ?? '3000'}`
        default:
            return `http://localhost:${process.env.PORT ?? '3000'}`
    }
}

/**
 * Only to be used when using non-next APIs that don't automatically prepend basepath
 */
export function pathWithBasePath(path: `/${string}`): string {
    return `${bundledEnv.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
}
