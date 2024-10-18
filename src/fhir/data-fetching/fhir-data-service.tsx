import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'

import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getName, getOid } from './schema/mappers/patient'
import { FhirPractitionerSchema } from './schema/practitioner'

/**
 * FHIR-specific implementation of NySykmeldingFormDataService. Used to create the generic interface the form uses to
 * the actual data through the fhirclient-context.
 */
export const createFhirDataService = (client: ReturnType<typeof fhirClient>): NySykmeldingFormDataService => {
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
                    navn: getName(firstPatient.name),
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
            bruker: async () => {
                await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000))
                const practitioner = await client.request('Practitioner')

                const parsed = FhirPractitionerSchema.safeParse(practitioner)
                if (!parsed.success) {
                    logger.error('Failed to parse practitioner', parsed.error)
                    throw parsed.error
                }

                return {
                    navn: getName(parsed.data.name),
                    epjDescription: 'Fake EPJ V0.89',
                }
            },
        },
        query: {
            pasient: NotAvailable,
        },
    }
}
