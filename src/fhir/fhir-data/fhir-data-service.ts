import { BehandlerInfo, DataService, NotAvailable } from '../../data-fetcher/data-service'

import { fhirResources } from './fhir-data'
import { nonFhirResources } from './non-fhir-data'

export function createFhirDataService(behandler: BehandlerInfo): DataService {
    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => fhirResources.getFhirPatient(),
            konsultasjon: () => fhirResources.getFhirKonsultasjon(),
            arbeidsgivere: NotAvailable,
            tidligereSykmeldinger: () => nonFhirResources.getTidligereSykmeldinger(),
        },
        query: {
            pasient: (ident) => nonFhirResources.getPasient(ident),
            sykmelding: (id) => nonFhirResources.getSykmelding(id, behandler.hpr),
        },
        mutation: {
            sendSykmelding: (sykmelding) => nonFhirResources.sendSykmelding(sykmelding, behandler.hpr),
            writeToEhr: (sykmelding) => nonFhirResources.writeToEhr(sykmelding),
        },
    }
}
