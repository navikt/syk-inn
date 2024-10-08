import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'

import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getName, getOid } from './schema/mappers/patient'

export const createFhirFetcher = (client: ReturnType<typeof fhirClient>): NySykmeldingFormDataService => {
    return {
        context: {
            getPasient: async () => {
                const patient = await client.request('Patient')
                const parsed = FhirBundleOrPatientSchema.safeParse(patient)

                if (parsed.error) {
                    logger.error('Failed to parse patient', parsed.error)
                    throw parsed.error
                }

                const firstPatient =
                    parsed.data?.resourceType === 'Bundle' ? parsed.data.entry[0].resource : parsed.data

                if (parsed.data?.resourceType === 'Bundle') {
                    logger.warn(
                        `Multiple patients found, using the first one, there was ${parsed.data.entry.length - 1} others`,
                    )
                }

                return {
                    navn: getName(firstPatient),
                    fnr: getOid(firstPatient),
                    oid: {
                        // TODO: Don't hardcode
                        type: 'fødselsnummer',
                        nr: getOid(firstPatient),
                    },
                }
            },
        },
        query: {
            getPasientByFnr: NotAvailable,
        },
    }
}
