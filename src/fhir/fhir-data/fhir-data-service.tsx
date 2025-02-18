import { client as fhirClient } from 'fhirclient'

import { DataService } from '../../data-fetcher/data-service'

import { getArbeidsgivere, getPerson, getSykmelding, sendSykmelding } from './non-fhir-data'
import { getFhirEncounter, getFhirPatient, getFhirPractitioner } from './fhir-data'

export type FhirClient = ReturnType<typeof fhirClient>

/**
 * FHIR-specific implementation of DataService. Used to create the generic interface the form uses to
 * the actual data through the fhirclient-context.
 */
export async function createFhirDataService(client: FhirClient): Promise<DataService> {
    const behandler = await getFhirPractitioner(client)

    return {
        mode: 'fhir',
        context: {
            behandler,
            pasient: () => getFhirPatient(client),
            konsultasjon: () => getFhirEncounter(client),
            arbeidsgivere: () => getArbeidsgivere(),
        },
        query: {
            pasient: (ident) => getPerson(client, ident),
            sykmelding: (id) => getSykmelding(client, behandler.hpr, id),
        },
        mutation: {
            sendSykmelding: (values) => sendSykmelding(client, behandler.hpr, values),
        },
    }
}
