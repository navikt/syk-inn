import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'

import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

import { FhirPatientSchema } from './schema/patient'
import { getName, getOid } from './schema/mappers/patient'

export const createFhirFetcher = (client: ReturnType<typeof fhirClient>): NySykmeldingFormDataService => {
    return {
        context: {
            getPasient: async () => {
                const patient = await client.request('Patient')
                const parsed = FhirPatientSchema.safeParse(patient)

                if (parsed.error) {
                    logger.error('Failed to parse patient', parsed.error)
                    throw parsed.error
                }

                return {
                    navn: getName(parsed.data),
                    fnr: getOid(parsed.data),
                    oid: {
                        // TODO: Don't hardcode
                        type: 'fødselsnummer',
                        nr: getOid(parsed.data),
                    },
                }
            },
        },
        query: {
            getPasientByFnr: NotAvailable,
        },
    }
}
