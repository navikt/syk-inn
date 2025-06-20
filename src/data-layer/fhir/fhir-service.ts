import { logger } from '@navikt/next-logger'

import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { sykInnApiService } from '@services/syk-inn-api/syk-inn-api-service'
import { getHpr } from '@fhir/mappers/practitioner'
import { createNewDocumentReferencePayload } from '@fhir/mappers/document-reference'
import { FhirDocumentReferenceBase, FhirPractitioner } from '@navikt/fhir-zod'
import { toReadableDatePeriod } from '@utils/date'
import { SykInnApiSykmelding } from '@services/syk-inn-api/schema/sykmelding'
import { spanAsync } from '@otel/otel'
import { getReadyClient } from '@fhir/smart/smart-client'

/**
 * Uses the FHIR client to fetch the Practitioner resource for the current user.
 *
 * With required hacks.
 */
export async function getPractitioner(client: ReadyClient): Promise<FhirPractitioner> {
    return spanAsync('get practitioner', async () => {
        if (!client.fhirUser.startsWith('Practitioner/')) {
            logger.error(`fhirUser is not a Practitioner, was: ${client.fhirUser}`)
            throw new Error('fhirUser is not a Practitioner')
        }

        logger.info(`Trying to fetch fhirUser from /Practitioner/${client.fhirUser}`)
        const practitioner = await client.request(`/${client.fhirUser}` as `/Practitioner/${string}`)

        if ('error' in practitioner) {
            throw new Error(`Unable to fetch 'behandler', reason: ${practitioner.error}`)
        }

        return practitioner
    })
}

export async function getHprFromFhirSession(
    client?: ReadyClient,
): Promise<string | { error: 'NO_SESSION' | 'NO_HPR' }> {
    const readyClient = client ?? (await getReadyClient())
    if ('error' in readyClient) {
        logger.warn(`Unable to get ready client, reason: ${readyClient.error}`)
        return { error: 'NO_SESSION' }
    }

    const practitioner = await getPractitioner(readyClient)
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
): Promise<FhirDocumentReferenceBase | { error: 'API_ERROR' } | { error: 'PARSING_ERROR' }> {
    const practitioner = await client.request(`/${client.fhirUser}`)
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

    const createdDocumentReference = await client.create('/DocumentReference', {
        payload: createNewDocumentReferencePayload(
            {
                sykmeldingId,
                patientId: client.patient,
                encounterId: client.encounter,
                // TODO: hmmmm
                practitionerId: client.fhirUser.split('/')[1],
                description: getSykmeldingDescription(sykmelding.values),
            },
            Buffer.from(pdfBuffer).toString('base64'),
        ),
    })

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
