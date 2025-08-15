import { KnownFhirServer } from '@navikt/smart-on-fhir/client'

import { bundledEnv } from '@lib/env'

import { getKnownDevFhirServers } from './envs/dev-gcp'
import { getKnownProdFhirServers } from './envs/prod-gcp'
import { getDemoKnownFhirServers, getLocalKnownFhirServers } from './envs/others'

export function getKnownFhirServers(): KnownFhirServer[] {
    switch (bundledEnv.runtimeEnv) {
        case 'dev-gcp':
            return getKnownDevFhirServers()
        case 'prod-gcp':
            return getKnownProdFhirServers()
        case 'e2e':
        case 'local':
            return getLocalKnownFhirServers()
        case 'demo':
            return getDemoKnownFhirServers()
    }
}
