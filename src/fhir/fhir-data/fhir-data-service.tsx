import * as R from 'remeda'
import { client as fhirClient } from 'fhirclient'
import { logger } from '@navikt/next-logger'
import { z } from 'zod'

import { raise } from '@utils/ts'
import { wait } from '@utils/wait'
import { getHpr } from '@fhir/fhir-data/schema/mappers/practitioner'
import { diagnosisUrnToOidType, getDiagnosis } from '@fhir/fhir-data/schema/mappers/diagnosis'
import { FhirConditionSchema } from '@fhir/fhir-data/schema/condition'
import { FhirEncounterSchema } from '@fhir/fhir-data/schema/encounter'
import { getPerson, getSykmelding, sendSykmelding } from '@fhir/fhir-data/non-fhir-data'

import {
    ArbeidsgiverInfo,
    Autorisasjoner,
    BehandlerInfo,
    DataService,
    KonsultasjonInfo,
    PasientInfo,
} from '../../data-fetcher/data-service'

import { FhirBundleOrPatientSchema } from './schema/patient'
import { getFastlege, getName, getValidPatientOid } from './schema/mappers/patient'
import { FhirPractitionerQualification, FhirPractitionerSchema } from './schema/practitioner'

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

async function getFhirPatient(client: FhirClient): Promise<PasientInfo> {
    await wait()
    // TODO: Handle client.patient.id being null (can we launch without patient?)
    const patient: unknown = await client.request(`Patient/${client.patient.id ?? raise('client.patient.id is null')}`)
    const parsed = FhirBundleOrPatientSchema.safeParse(patient)

    if (!parsed.success) {
        logger.error('Failed to parse patient', parsed.error)
        throw parsed.error
    }

    if (parsed.data.resourceType === 'Bundle') {
        raise("We don't support bundles haha")
    }

    return {
        navn: getName(parsed.data.name),
        oid: getValidPatientOid(parsed.data),
        fastlege: getFastlege(parsed.data),
    }
}

async function getFhirEncounter(client: FhirClient): Promise<KonsultasjonInfo> {
    await wait()

    const patientConditionList: unknown = await client.request(`Condition?patient=${client.patient.id}`)
    const parsedConditionList = z.array(FhirConditionSchema).safeParse(patientConditionList)

    const encounter: unknown = await client.request(`Encounter/${client.encounter.id}`)
    const parsedEncounter = FhirEncounterSchema.safeParse(encounter)

    if (!parsedConditionList.success) {
        logger.error('Failed to parse conditions', parsedConditionList.error)
        throw parsedConditionList.error
    }

    const [relevanteDignoser, irrelevanteDiagnoser] = parsedConditionList.data
        ? R.partition(parsedConditionList.data, (diagnosis) =>
              diagnosis.code.coding.some((coding) => diagnosisUrnToOidType(coding.system) != null),
          )
        : [[], []]

    logger.info(
        `Fant ${relevanteDignoser.length} med gyldig ICPC-2 eller ICD-10 kode, ${irrelevanteDiagnoser.length} uten gyldig kode`,
    )

    const fhirDiagnose = parsedEncounter.data?.reasonCode
        ? getDiagnosis(parsedEncounter.data.reasonCode[0].coding)
        : null

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
