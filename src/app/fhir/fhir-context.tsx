import { client as fhirClient } from 'fhirclient'

import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

export const createFhirFetcher = (client: ReturnType<typeof fhirClient>): NySykmeldingFormDataService => {
    return {
        context: {
            getPasient: async () => {
                const patient = await client.request('Patient')

                // TODO: Actually map from FHIR-data to generic data
                // eslint-disable-next-line no-console
                console.log(patient)
                return {
                    navn: 'FHIR Fhirresson',
                    fnr: '12345678910',
                }
            },
        },
        query: {
            getPasientByFnr: NotAvailable,
        },
    }
}
