import { DataService } from '@data-layer/data-fetcher/data-service'
import { Behandler } from '@data-layer/resources'

import { fhirResources } from './fhir-resources'

/**
 * Implementation of the generic DataService for the FHIR contextually launched app.
 */
export function createFhirDataService(behandler: Behandler): DataService {
    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => fhirResources.getPasient(),
            konsultasjon: () => fhirResources.getKonsultasjon(),
        },
        query: {
            pasient: (ident) => fhirResources.queryPerson(ident),
            sykmelding: (id) => fhirResources.getSykmelding(id),
        },
        mutation: {
            sendSykmelding: (sykmelding) => fhirResources.sendSykmelding(sykmelding),
            synchronize: (sykmeldingId) => fhirResources.synchronizeSykmelding(sykmeldingId),
        },
    }
}
