import { ReadyClient, ResourceRequestErrors } from '@navikt/smart-on-fhir/client'

import { Diagnose } from '#data-layer/common/diagnose'
import { failSpan, spanServerAsync } from '#lib/otel/server'
import metrics from '#lib/prometheus/metrics'

import { Behandler, BehandlerMeta, Pasient } from './fhir-resource-types'
import { fhirDiagnosisToRelevantDiagnosis } from './mappers/diagnosis'
import { getHprFromFhir, getIdentFromFhir, getNameFromFhir, isValidIdent, isValidName } from './mappers/identifiers'
import { getOrganisasjonsnummerFromFhir, getOrganisasjonstelefonnummerFromFhir } from './mappers/organization'

export type ResourceError<T extends string = never> =
    | ResourceRequestErrors
    | ([T] extends [never] ? never : { error: T })

export function isResourceError<T extends string>(value: unknown): value is ResourceError<T> {
    return typeof value === 'object' && value !== null && 'error' in value
}

/**
 * Resources fetched:
 *  - Patient
 */
export async function getPasient(client: ReadyClient): Promise<Pasient | ResourceError<'NO_IDENT' | 'NO_NAME'>> {
    return spanServerAsync('FHIR.getPasient', async (span) => {
        const patient = await client.patient.request()
        if ('error' in patient) {
            failSpan(span, `Failed to get patient from FHIR: ${patient.error}`)
            return patient
        }

        const patientName = getNameFromFhir(patient.name)
        const patientIdent = getIdentFromFhir(patient.identifier)

        if (!isValidIdent(patientIdent)) {
            failSpan(span, `Patient without valid ident: ${patientIdent.error}`)
            return { error: 'NO_IDENT' }
        }

        if (!isValidName(patientName)) {
            failSpan(span, `Patient without valid name: ${patientName.error}`)
            return { error: 'NO_NAME' }
        }

        return { ident: patientIdent, navn: patientName }
    })
}

/**
 * Resources fetched:
 *  - Practitioner
 */
export async function getBehandler(client: ReadyClient): Promise<Behandler | ResourceError<'NO_HPR' | 'NO_NAME'>> {
    return spanServerAsync('FHIR.getBehandler', async (span) => {
        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, `Failed to get practitioner from FHIR: ${practitioner.error}`)
            return practitioner
        }

        const hpr = getHprFromFhir(practitioner.identifier)
        if (!isValidIdent(hpr)) {
            failSpan(span, `Practitioner without HPR: ${hpr.error}`)
            return { error: 'NO_HPR' }
        }

        const navn = getNameFromFhir(practitioner.name)
        if (!isValidName(navn)) {
            failSpan(span, `Practitioner without valid name: ${navn.error}`)
            return { error: 'NO_NAME' }
        }

        return { hpr, navn, epost: null }
    })
}

/**
 * Resources fetched:
 *  - Encounter
 *  - Organization (by Encounter.serviceProvider)
 */
export async function getExtendedBehandlerMeta(
    client: ReadyClient,
): Promise<BehandlerMeta | ResourceError<'NO_ORGNUMMER' | 'NO_PHONE'>> {
    return spanServerAsync('FHIR.getExtendedBehandlerMeta', async (span) => {
        const encounter = await client.encounter.request()
        if ('error' in encounter) {
            failSpan(span, `Failed to get encounter from FHIR: ${encounter.error}`)
            return encounter
        }

        const organization = await client.request(encounter.serviceProvider.reference as `Organization/${string}`)
        if ('error' in organization) {
            failSpan(span, `Failed to get organization from FHIR: ${organization.error}`)
            return organization
        }

        const orgnummer = getOrganisasjonsnummerFromFhir(organization)
        if (orgnummer == null) {
            failSpan(span, `Organization without valid orgnummer`)
            return { error: 'NO_ORGNUMMER' }
        }

        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
        if (legekontorTlf == null) {
            const cause = Error(
                `Organization without valid phone number, but we found ${organization.telecom.map((it) => it.system).join(', ')}`,
            )
            failSpan(span, `Organization without valid phone number`, cause)
            return { error: 'NO_PHONE' }
        }

        return {
            orgnummer,
            legekontorTlf,
        }
    })
}

/**
 * Resources fetched:
 *  - Condition (by Encounter)
 */
export async function getDiagnosisInEncounter(client: ReadyClient): Promise<Diagnose[] | ResourceError> {
    return spanServerAsync('FHIR.getDiagnosisInEncounter', async (span) => {
        const conditionsByEncounter = await client.request(`Condition?encounter=${client.encounter.id}`)
        if ('error' in conditionsByEncounter) {
            failSpan(span, `Failed to get conditions from FHIR: ${conditionsByEncounter.error}`)
            return conditionsByEncounter
        }

        if (conditionsByEncounter.entry == null) {
            metrics.numberOfDiagnosesFetched.observe(0)
            return []
        }

        const conditionList = conditionsByEncounter.entry.map((it) => it.resource)
        metrics.numberOfDiagnosesFetched.observe(conditionList.length)

        return fhirDiagnosisToRelevantDiagnosis(conditionList)
    })
}
