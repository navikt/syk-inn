import { DataService } from '@data-layer/data-fetcher/data-service'
import { Behandler } from '@data-layer/resources'

import { fhirResources } from './fhir-data'
import { nonFhirResources } from './non-fhir-data'

export function createFhirDataService(behandler: Behandler): DataService {
    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => fhirResources.getFhirPatient(),
            konsultasjon: () => fhirResources.getFhirKonsultasjon(),
        },
        query: {
            pasient: (ident) => nonFhirResources.getPasient(ident),
            sykmelding: (id) => nonFhirResources.getSykmelding(id),
        },
        mutation: {
            sendSykmelding: (sykmelding) => nonFhirResources.sendSykmelding(sykmelding),
            synchronize: (sykmeldingId) => nonFhirResources.synchronizeSykmelding(sykmeldingId),
        },
    }
}
