import { raise } from '@utils/ts'

import { BehandlerInfo, DataService, NotAvailable } from '../../data-fetcher/data-service'

import { getFhirPatient } from './fhir-data'

export function createSecureFhirDataService(behandler: BehandlerInfo): DataService {
    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => getFhirPatient(),
            konsultasjon: NotAvailable,
            arbeidsgivere: NotAvailable,
            tidligereSykmeldinger: NotAvailable,
        },
        query: {
            pasient: () => raise('TODO'),
            sykmelding: () => raise('TODO'),
        },
        mutation: {
            sendSykmelding: () => raise('TODO'),
        },
    }
}
