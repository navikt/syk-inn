import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

export function getLocalKnownFhirServers(): KnownFhirServer[] {
    return [
        {
            name: 'SMART Health IT (test)',
            issuer: 'https://launch.smarthealthit.org/v/r4/fhir',
            type: 'public',
        },
        {
            name: 'Local FHIR server (test)',
            issuer: 'http://localhost:3000/api/mocks/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        },
    ]
}

export function getDemoKnownFhirServers(): KnownFhirServer[] {
    return [
        {
            name: 'syk-inn demo mock (test)',
            issuer: 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir',
            type: 'confidential-symmetric',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        },
    ]
}
