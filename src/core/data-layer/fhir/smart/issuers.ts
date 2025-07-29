import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

import { bundledEnv } from '@lib/env'

/**
 * Should be provided by an external configuration or self-service system. But for now we'll hardcode the trusted issuers.
 */
export const knownFhirServers: KnownFhirServer[] = [
    { issuer: 'https://launch.smarthealthit.org/v/r4/fhir', type: 'public' },
    { issuer: 'https://fhir.ekstern.dev.nav.no', type: 'public' },
    { issuer: 'https://fhir-api-auth.public.webmedepj.no', type: 'public' },
]

switch (bundledEnv.runtimeEnv) {
    case 'local':
    case 'e2e':
        knownFhirServers.push({
            issuer: 'http://localhost:3000/api/mocks/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        })
        break
    case 'demo':
        knownFhirServers.push({
            issuer: 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        })
        break
    case 'dev-gcp':
    case 'prod-gcp':
        break
}
