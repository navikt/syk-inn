import { logger } from '@navikt/next-logger'
import { ReadyClient, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { FhirDocumentReference } from '@navikt/smart-on-fhir/zod'

import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { createNewDocumentReferencePayload } from '@data-layer/fhir/mappers/document-reference'
import { toReadableDatePeriod } from '@lib/date'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { getReadyClient } from '@data-layer/fhir/smart/smart-client'
import { getFlag, getUserlessToggles } from '@core/toggles/unleash'

export async function getHprFromFhirSession(
    client?: ReadyClient,
): Promise<string | { error: 'NO_SESSION' | 'NO_HPR' }> {
    const autoTokenRefresh = getFlag('SYK_INN_REFRESH_TOKEN', await getUserlessToggles()).enabled
    const readyClient = client ?? (await getReadyClient({ validate: true, autoRefresh: autoTokenRefresh }))
    if ('error' in readyClient) {
        logger.warn(`Unable to get ready client, reason: ${readyClient.error}`)
        return { error: 'NO_SESSION' }
    }

    const practitioner = await readyClient.user.request()
    if ('error' in practitioner) {
        return { error: 'NO_SESSION' }
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        logger.warn(`Practitioner does not have HPR, practitioner: ${JSON.stringify(practitioner)}`)
        return { error: 'NO_HPR' }
    }

    return hpr
}

/**
 * Fetches corresponding info from syk-inn-api and creates a new DocumentReference resource in the FHIR server.
 */
export async function createDocumentReference(
    client: ReadyClient,
    sykmeldingId: string,
): Promise<FhirDocumentReference | { error: 'API_ERROR' } | { error: 'PARSING_ERROR' }> {
    const practitioner = await client.user.request()
    if ('error' in practitioner) {
        return { error: 'API_ERROR' }
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        return { error: 'PARSING_ERROR' }
    }

    const [sykmelding, pdfBuffer] = await Promise.all([
        sykInnApiService.getSykmelding(sykmeldingId, hpr),
        sykInnApiService.getSykmeldingPdf(sykmeldingId, hpr),
    ])

    if ('errorType' in pdfBuffer || 'errorType' in sykmelding) {
        return { error: 'API_ERROR' }
    }

    const createdDocumentReference: FhirDocumentReference | ResourceCreateErrors = await client.create(
        'DocumentReference',
        {
            payload: createNewDocumentReferencePayload(
                {
                    sykmeldingId,
                    patientId: client.patient.id,
                    encounterId: client.encounter.id,
                    // TODO: hmmmm
                    practitionerId: client.user.fhirUser.split('/')[1],
                    description: getSykmeldingDescription(sykmelding.values),
                },
                Buffer.from(pdfBuffer).toString('base64'),
            ),
        },
    )

    if ('error' in createdDocumentReference) {
        return { error: 'API_ERROR' }
    }

    return createdDocumentReference
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
