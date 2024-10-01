import { bundledEnv } from '@utils/env'

export function getBaseURL(): string {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'local':
            return 'http://localhost:3000'
        case 'demo':
            return 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding'
        default:
            throw new Error(`Unknown runtime environment ${bundledEnv.NEXT_PUBLIC_RUNTIME_ENV}`)
    }
}
