import * as R from 'remeda'
import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'
import { z } from 'zod'

import {
    ArbeidsgiverInfo,
    Autorisasjoner,
    BehandlerInfo,
    KonsultasjonInfo,
    NotAvailable,
    NySykmelding,
    NySykmeldingFormDataService,
    PasientInfo,
} from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { getHpr } from '@fhir/data-fetching/schema/mappers/practitioner'
import { diagnosisUrnToOidType, getDiagnosis } from '@fhir/data-fetching/schema/mappers/diagnosis'
import { FhirConditionSchema } from '@fhir/data-fetching/schema/condition'
import { pathWithBasePath } from '@utils/url'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getFastlege, getName, getValidPatientOid } from './schema/mappers/patient'
import { FhirPractitionerQualification, FhirPractitionerSchema } from './schema/practitioner'
import { FhirEncounterSchema } from '@fhir/data-fetching/schema/encounter'

type FhirClient = ReturnType<typeof fhirClient>

/**
 * FHIR-specific implementation of NySykmeldingFormDataService. Used to create the generic interface the form uses to
 * the actual data through the fhirclient-context.
 */
export const createFhirDataService = async (client: FhirClient): Promise<NySykmeldingFormDataService> => {
    const behandler = await getFhirPractitioner(client)

    return {
        context: {
            behandler,
            // TODO: Better name to describe this curried function?
            pasient: createGetFhirPasientFn(client),
            konsultasjon: createGetFhirEncounterFn(client),
            arbeidsgivere: getArbeidsgivere,
        },
        query: {
            pasient: NotAvailable,
        },
        mutation: {
            sendSykmelding: createSendSykmeldingFn(client, behandler.hpr),
        },
    }
}

function createGetFhirPasientFn(client: FhirClient) {
    return async (): Promise<PasientInfo> => {
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
            oid: getValidPatientOid(patient),
            fastlege: getFastlege(patient),
        }
    }
}

function createGetFhirEncounterFn(client: FhirClient) {
    return async (): Promise<KonsultasjonInfo> => {
        await wait()

        const encounter = await client.request(`Condition?patient=${client.patient.id}`)
        const parsed = z.array(FhirConditionSchema).safeParse(encounter)
        const enc = await client.request(`Encounter/${client.encounter.id}`)

        const safeParse = FhirEncounterSchema.safeParse(enc)

        if (!parsed.success) {
            logger.error('Failed to parse conditions', parsed.error)
            throw parsed.error
        }

        const [relevanteDignoser, irrelevanteDiagnoser] = parsed.data
            ? R.partition(parsed.data, (diagnosis) =>
                  diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
              )
            : [[], []]

        logger.info(
            `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
        )

        const fhirDiagnose = safeParse.data?.reasonCode ? getDiagnosis(safeParse.data.reasonCode[0].coding) : null

        return {
            diagnoser: R.pipe(
                relevanteDignoser,
                R.map((diagnosis) => getDiagnosis(diagnosis.code.coding)),
                R.filter(R.isTruthy),
                R.map((it) => ({
                    system: it.system,
                    kode: it.code,
                    tekst: it.display,
                })),
            ),
            diagnose: fhirDiagnose
                ? {
                      system: fhirDiagnose.system,
                      kode: fhirDiagnose.code,
                      tekst: fhirDiagnose.display,
                  }
                : null,
        }
    }
}

async function getFhirPractitioner(client: FhirClient): Promise<BehandlerInfo> {
    await wait()

    // TODO: Gracefully handle different fhirUsers?
    let practitioner: unknown
    if (client.user.fhirUser) {
        // This should be available in all FHIR apis
        practitioner = await client.request(client.user.fhirUser)
    } else {
        // Temporary WebMed hack:
        const practitionerId = client.getState('tokenResponse.practitioner')
        practitioner = await client.request(`Practitioner/${practitionerId}`)

        logger.error(
            `Hit WebMed fallback, got Practitioner from tokenResponse instead, is null: ${practitioner == null}`,
        )
    }

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
        autorisasjoner: parsed.data.qualification ? getAutorisasjoner(parsed.data.qualification) : [],
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

function createSendSykmeldingFn(client: FhirClient, hpr: string) {
    return async (values: unknown): Promise<NySykmelding> => {
        await wait()
        const response = await fetch(pathWithBasePath('/fhir/sykmelding/submit'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: client.state.tokenResponse?.id_token ?? raise('No active Smart Session'),
            },
            body: JSON.stringify({
                values,
                behandlerHpr: hpr,
            }),
        })

        if (!response.ok) {
            if (response.headers.get('content-type')?.includes('application/json')) {
                const errors = await response.json()
                logger.error(`Sykmelding creation failed (${response.status} ${response.statusText}), errors`, {
                    cause: errors,
                })
            } else {
                logger.error(`API Responded with error ${response.status} ${response.statusText}`)
            }
            throw new Error('API Responded with error')
        }

        return response.json()
    }
}

function getAutorisasjoner(qualification: FhirPractitionerQualification[]): Autorisasjoner {
    return R.pipe(
        qualification,
        R.map((it) => it.code.coding),
        R.map(
            (it) =>
                ({
                    kategori:
                        getCodingByUrn('urn:oid:2.16.578.1.12.4.1.1.9060', it) ??
                        raise("Practitioner without 'helsepersonell kategori'"),
                    autorisasjon: getCodingByUrn('urn:oid:2.16.578.1.12.4.1.1.7704', it),
                    spesialisering: getCodingByUrn('urn:oid:2.16.578.1.12.4.1.1.7426', it),
                }) satisfies Autorisasjoner[number],
        ),
    )
}

function getCodingByUrn<
    T extends
        | 'urn:oid:2.16.578.1.12.4.1.1.9060'
        | 'urn:oid:2.16.578.1.12.4.1.1.7704'
        | 'urn:oid:2.16.578.1.12.4.1.1.7426',
>(
    urn: T,
    codings: FhirPractitionerQualification['code']['coding'],
): {
    system: T
    code: string
    display: string
} | null {
    const match = codings.find((coding) => coding.system === urn)
    if (match) {
        return {
            system: urn,
            code: match.code,
            display: match.display,
        }
    }
    return null
}
