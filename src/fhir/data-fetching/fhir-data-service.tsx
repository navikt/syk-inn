import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'

import {
    ArbeidsgiverInfo,
    BrukerInfo,
    NotAvailable,
    NySykmeldingFormDataService,
    PatientInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { raise } from '@utils/ts'
import { wait } from '@utils/wait'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getName, getOid } from './schema/mappers/patient'
import { FhirPractitionerSchema } from './schema/practitioner'

type FhirClient = ReturnType<typeof fhirClient>

/**
 * FHIR-specific implementation of NySykmeldingFormDataService. Used to create the generic interface the form uses to
 * the actual data through the fhirclient-context.
 */
export const createFhirDataService = (client: FhirClient): NySykmeldingFormDataService => {
    return {
        context: {
            pasient: getFhirPasient(client),
            bruker: getFhirPractitioner(client),
            arbeidsgivere: getArbeidsgivere,
        },
        query: {
            pasient: NotAvailable,
        },
    }
}

function getFhirPasient(client: FhirClient) {
    return async (): Promise<PatientInfo> => {
        await wait()
        // TODO: Handle client.patient.id being null (can we launch without patient?)
        const patient = await client.request(`Patient/${client.patient.id ?? raise('client.patient.id is null')}`)
        const parsed = FhirBundleOrPatientSchema.safeParse(patient)

        if (!parsed.success) {
            logger.error('Failed to parse patient', parsed.error)
            throw parsed.error
        }

        return {
            navn: getName(patient.name),
            oid: getOid(patient),
        }
    }
}

function getFhirPractitioner(client: FhirClient) {
    return async (): Promise<BrukerInfo> => {
        if (client.user.fhirUser == null) {
            throw new Error('No FHIR-user available')
        }

        await wait()

        // TODO: Gracefully handle different fhirUsers?
        const practitioner = await client.request(client.user.fhirUser)

        const parsed = FhirPractitionerSchema.safeParse(practitioner)
        if (!parsed.success) {
            logger.error('Failed to parse practitioner', parsed.error)
            throw parsed.error
        }

        return {
            navn: getName(parsed.data.name),
            epjDescription: 'Fake EPJ V0.89',
        }
    }
}

async function getArbeidsgivere(): Promise<ArbeidsgiverInfo[]> {
    await wait()

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
}
