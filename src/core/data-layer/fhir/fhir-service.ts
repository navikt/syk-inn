import { logger } from '@navikt/next-logger'
import { ReadyClient, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { FhirDocumentReference } from '@navikt/smart-on-fhir/zod'
import { GraphQLError } from 'graphql/error'
import { teamLogger } from '@navikt/next-logger/team-log'

import { toReadableDatePeriod } from '@lib/date'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import {
    getOrganisasjonsnummerFromFhir,
    getOrganisasjonstelefonnummerFromFhir,
} from '@data-layer/fhir/mappers/organization'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'

import { getHpr } from './mappers/practitioner'
import { createNewDocumentReferencePayload } from './mappers/document-reference'
import { getReadyClient } from './smart/ready-client'

/**
 * Chonky boi. Fetches the FHIR resources: Practitioner, Patient, Encounter and Organization, and extracts the relevant
 * metadata needed to create or validate a new sykmelding in syk-inn-api.
 */
export async function getAllSykmeldingMetaFromFhir(
    client: ReadyClient,
): Promise<Omit<OpprettSykmeldingMeta, 'source'>> {
    return spanServerAsync('FhirService.all-meta-resources', async (span) => {
        const [practitioner, encounter] = await Promise.all([client.user.request(), client.encounter.request()])

        if ('error' in practitioner || 'error' in encounter) {
            if ('error' in practitioner) failSpan(span, practitioner.error)
            if ('error' in encounter) failSpan(span, encounter.error)

            throw new GraphQLError('API_ERROR')
        }

        const sykmelderHpr = getHpr(practitioner.identifier)
        if (sykmelderHpr == null) {
            failSpan(span, 'Missing HPR identifier in practitioner resource')
            teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
            throw new GraphQLError('PARSING_ERROR')
        }

        const [patient, organization] = await Promise.all([
            client.patient.request(),
            client.request(encounter.serviceProvider.reference as `Organization/${string}`),
        ])

        if ('error' in patient || 'error' in organization) {
            if ('error' in patient) failSpan(span, patient.error)
            if ('error' in organization) failSpan(span, organization.error)

            throw new GraphQLError('API_ERROR')
        }

        const legekontorOrgnr = getOrganisasjonsnummerFromFhir(organization)
        if (legekontorOrgnr == null) {
            failSpan(span, 'Organization without valid orgnummer')
            teamLogger.error(`Organization without valid orgnummer: ${JSON.stringify(organization, null, 2)}`)
            throw new GraphQLError('API_ERROR')
        }

        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
        if (legekontorTlf == null) {
            failSpan(span, 'Organization without valid phone number')
            teamLogger.error(`Organization without valid phone number: ${JSON.stringify(organization, null, 2)}`)
            throw new GraphQLError('API_ERROR')
        }

        const pasientIdent = getValidPatientIdent(patient.identifier)
        if (pasientIdent == null) {
            failSpan(span, 'Patient without valid FNR/DNR')
            teamLogger.error(`Patient without valid FNR/DNR: ${JSON.stringify(patient, null, 2)}`)
            throw new GraphQLError('API_ERROR')
        }

        return {
            sykmelderHpr,
            pasientIdent,
            legekontorOrgnr,
            legekontorTlf,
        }
    })
}

export async function getHprFromFhirSession(): Promise<string | { error: 'NO_SESSION' | 'NO_HPR' }> {
    return spanServerAsync('FhirService.hpr-from-fhir-session', async (span) => {
        const readyClient = await getReadyClient()
        if ('error' in readyClient) {
            failSpan.silently(span, readyClient.error)
            return { error: 'NO_SESSION' }
        }

        const practitioner = await readyClient.user.request()
        if ('error' in practitioner) {
            failSpan.silently(span, practitioner.error)
            return { error: 'NO_SESSION' }
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            logger.warn(`Practitioner does not have HPR, practitioner: ${JSON.stringify(practitioner)}`)
            return { error: 'NO_HPR' }
        }

        return hpr
    })
}

/**
 * Fetches corresponding info from syk-inn-api and creates a new DocumentReference resource in the FHIR server.
 */
export async function createDocumentReference(
    client: ReadyClient,
    sykmeldingId: string,
): Promise<FhirDocumentReference | { error: 'API_ERROR' } | { error: 'PARSING_ERROR' }> {
    return spanServerAsync('FhirService.createDocumentReference', async (span) => {
        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, practitioner.error)
            return { error: 'API_ERROR' }
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            failSpan(span, 'Missing HPR identifier in practitioner resource')
            return { error: 'PARSING_ERROR' }
        }

        const [sykmelding, pdfBuffer] = await Promise.all([
            sykInnApiService.getSykmelding(sykmeldingId, hpr),
            sykInnApiService.getSykmeldingPdf(sykmeldingId, hpr),
        ])

        if ('errorType' in pdfBuffer || 'errorType' in sykmelding) {
            if ('errorType' in pdfBuffer) failSpan(span, `Failed fetching PDF: ${pdfBuffer.errorType}`)
            if ('errorType' in sykmelding) failSpan(span, `Failed fetching sykmelding: ${sykmelding.errorType}`)

            return { error: 'API_ERROR' }
        }

        if (sykmelding.kind === 'redacted') {
            logger.warn(
                `Tried creating document reference for redacted sykmelding with id ${sykmeldingId}, this is owned by ${sykmelding.meta.sykmelder.hprNummer}, not ${hpr}`,
            )
            return { error: 'API_ERROR' }
        }

        const createdDocumentReference: FhirDocumentReference | ResourceCreateErrors = await client.update(
            'DocumentReference',
            {
                id: sykmeldingId,
                payload: createNewDocumentReferencePayload(
                    {
                        sykmeldingId,
                        patientId: client.patient.id,
                        encounterId: client.encounter.id,
                        practitionerId: client.user.id,
                        description: getSykmeldingDescription(sykmelding.values),
                    },
                    Buffer.from(pdfBuffer).toString('base64'),
                ),
            },
        )

        if ('error' in createdDocumentReference) {
            failSpan(span, `Failed to create DocumentReference: ${createdDocumentReference.error}`)
            return { error: 'API_ERROR' }
        }

        if (createdDocumentReference.id !== sykmeldingId) {
            failSpan(
                span,
                'DocumentReference ID create mismatch',
                new Error(
                    `Created DocumentReference ID (${createdDocumentReference.id}) does not match the sykmelding ID (${sykmeldingId})`,
                ),
            )
        }

        return createdDocumentReference
    })
}

function getSykmeldingDescription(sykmelding: SykInnApiSykmelding['values']): string {
    const [firstAktivitet] = sykmelding.aktivitet

    let type
    switch (firstAktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            type = '100%'
            break
        case 'AVVENTENDE':
            type = 'Avventende'
            break
        case 'BEHANDLINGSDAGER':
            type = `${firstAktivitet.antallBehandlingsdager} behandlingsdager`
            break
        case 'GRADERT':
            type = `${firstAktivitet.grad}%`
            break
        case 'REISETILSKUDD':
            type = 'Reisetilskudd'
            break
    }

    return `${type} sykmelding, ${toReadableDatePeriod(firstAktivitet.fom, firstAktivitet.tom)}`
}
