import { bundledEnv } from '#lib/env'

export function getHelseIdUrl(): string {
    switch (bundledEnv.runtimeEnv) {
        case 'dev-gcp':
            return 'https://helseid-sts.test.nhn.no'
        case 'prod-gcp':
            return 'https://helseid-sts.nhn.no'
        case 'e2e':
        case 'local':
            return 'http://localhost:3000/api/mocks/helseid'
        case 'demo':
            return 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/helseid'
    }
}
