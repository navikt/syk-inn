import { BehandlerInfo, DataService } from '@data-layer/data-fetcher/data-service'

import { fhirResources } from './fhir-data'
import { nonFhirResources } from './non-fhir-data'

export function createFhirDataService(behandler: BehandlerInfo): DataService {
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
            writeToEhr: (sykmeldingId) => nonFhirResources.writeToEhr(sykmeldingId, behandler.hpr),
        },
    }
}
