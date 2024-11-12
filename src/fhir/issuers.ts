import { bundledEnv } from '@utils/env'

/**
 * Should be provided by an external configuration or self-service system. But for now we'll hardcode the trusted issuers.
 */
export const knownIssuers: string[] = ['https://launch.smarthealthit.org/v/r4/fhir']

switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
    case 'local':
    case 'e2e':
        knownIssuers.push('http://localhost:3000/api/mocks/fhir')
        break
    case 'demo':
        knownIssuers.push('https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir')
        break
    case 'dev-gcp':
    case 'prod-gcp':
        break
}
