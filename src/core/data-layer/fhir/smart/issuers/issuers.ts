import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

import { bundledEnv } from '@lib/env'

import { getKnownDevFhirServers } from './envs/dev-gcp'
import { getKnownProdFhirServers } from './envs/prod-gcp'

export function getKnownFhirServers(): KnownFhirServer[] {
    switch (bundledEnv.runtimeEnv) {
        case 'dev-gcp':
            return getKnownDevFhirServers()
        case 'prod-gcp':
            return getKnownProdFhirServers()
        case 'e2e':
        case 'local':
            return [
                { issuer: 'https://launch.smarthealthit.org/v/r4/fhir', type: 'public' },
                {
                    issuer: 'http://localhost:3000/api/mocks/fhir',
                    type: 'confidential-symmetric',
                    method: 'client_secret_basic',
                    clientSecret: 'dev-mode-client-secret',
                },
            ]
        case 'demo':
            return [
                {
                    issuer: 'https://syk-inn.ekstern.dev.nav.no/samarbeidspartner/sykmelding/api/mocks/fhir',
                    type: 'confidential-symmetric',
                    method: 'client_secret_basic',
                    clientSecret: 'dev-mode-client-secret',
                },
            ]
    }
}
