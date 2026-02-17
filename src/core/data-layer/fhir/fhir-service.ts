import { logger } from '@navikt/next-logger'
import { ReadyClient, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { FhirDocumentReference } from '@navikt/smart-on-fhir/zod'
import { GraphQLError } from 'graphql/error'

import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import {
    getOrganisasjonsnummerFromFhir,
    getOrganisasjonstelefonnummerFromFhir,
} from '@data-layer/fhir/mappers/organization'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { OpprettSykmeldingMeta } from '@core/services/syk-inn-api/schema/opprett'
import { gotenbergService } from '@data-layer/pdf/gotenberg-service'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'

import { getHpr } from './mappers/practitioner'
import { createNewDocumentReferencePayload } from './mappers/document-reference'

/**
 * Chonky boi. Fetches the FHIR resources: Practitioner, Patient, Encounter and Organization, and extracts the relevant
 * metadata needed to create or validate a new sykmelding in syk-inn-api.
 */
export async function getAllSykmeldingMetaFromFhir(
    client: ReadyClient,
): Promise<Omit<OpprettSykmeldingMeta, 'source' | 'sykmelderHpr'>> {
    return spanServerAsync('FhirService.all-meta-resources', async (span) => {
        const encounter = await client.encounter.request()

        if ('error' in encounter) {
            failSpan(span, encounter.error)

            throw new GraphQLError('API_ERROR')
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
            failSpan(
                span,
                'Organization without valid orgnummer',
                new Error(`Organization without valid orgnummer: ${JSON.stringify(organization, null, 2)}`),
            )
            throw new GraphQLError('API_ERROR')
        }

        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
        if (legekontorTlf == null) {
            failSpan(
                span,
                'Organization without valid phone number',
                new Error(`Organization without valid phone number: ${JSON.stringify(organization, null, 2)}`),
            )
            throw new GraphQLError('API_ERROR')
        }

        const pasientIdent = getValidPatientIdent(patient.identifier)
        if (pasientIdent == null) {
            failSpan(
                span,
                'Patient without valid FNR/DNR',
                new Error(
                    `Patient without valid FNR/DNR, found OIDs: ${patient.identifier?.map((id) => id.system).join(', ') || 'none'}`,
                ),
            )
            throw new GraphQLError('API_ERROR')
        }

        return {
            pasientIdent,
            legekontorOrgnr,
            legekontorTlf,
        }
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

        // Also generate PDF with gotenberg to compare speed
        await gotenbergService.generateGotenbergPdf(sykmelding).catch((err) => {
            // Ignore error while shadow-generating PDF
            logger.error(new Error('Shadow-gotenberg failed', { cause: err }))
        })

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
                        description: getSimpleSykmeldingDescription(sykmelding.values.aktivitet),
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
