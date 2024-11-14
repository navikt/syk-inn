import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'

import {
    ArbeidsgiverInfo,
    BehandlerInfo,
    NotAvailable,
    NySykmeldingFormDataService,
    PatientInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { getHpr } from '@fhir/data-fetching/schema/mappers/oid'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getName, getValidPasientOid } from './schema/mappers/patient'
import { FhirPractitionerSchema } from './schema/practitioner'

type FhirClient = ReturnType<typeof fhirClient>

/**
 * FHIR-specific implementation of NySykmeldingFormDataService. Used to create the generic interface the form uses to
 * the actual data through the fhirclient-context.
 */
export const createFhirDataService = async (client: FhirClient): Promise<NySykmeldingFormDataService> => {
    return {
        context: {
            behandler: await getFhirPractitioner(client),
            // TODO: Better name to describe this curried function?
            pasient: createGetFhirPasientFn(client),
            arbeidsgivere: getArbeidsgivere,
        },
        query: {
            pasient: NotAvailable,
        },
    }
}

function createGetFhirPasientFn(client: FhirClient) {
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
            oid: getValidPasientOid(patient),
        }
    }
}

async function getFhirPractitioner(client: FhirClient): Promise<BehandlerInfo> {
    if (client.user.fhirUser == null) {
        throw new Error('No FHIR-user available')
    }

    await wait()

    // TODO: Gracefully handle different fhirUsers?
    const practitioner: unknown = await client.request(client.user.fhirUser)

    const parsed = FhirPractitionerSchema.safeParse(practitioner)
    if (!parsed.success) {
        logger.error('Failed to parse practitioner', parsed.error)
        throw parsed.error
    }

    const hpr = getHpr(parsed.data.identifier)
    if (hpr == null) {
        // TODO: Don't log name?
        throw new Error(`Practitioner without HPR (${parsed.data.name})`)
    }

    return {
        navn: getName(parsed.data.name),
        epjDescription: 'Fake EPJ V0.89',
        hpr: hpr,
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
