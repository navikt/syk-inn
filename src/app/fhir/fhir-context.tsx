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
            pasient: async () => {
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
                    oid: getOid(firstPatient),
                }
            },
            arbeidsgivere: async () => {
                await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000))

                return [
                    {
                        navn: 'Arbeidsgiver 1',
                        organisasjonsnummer: '123456789',
                    },
                    {
                        navn: 'Arbeidsgiver 2',
                        organisasjonsnummer: '987654321',
                    },
                ]
            },
        },
        query: {
            pasient: NotAvailable,
        },
    }
}
