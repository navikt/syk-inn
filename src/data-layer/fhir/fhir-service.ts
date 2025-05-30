import { logger } from '@navikt/next-logger'

import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { getHpr } from '@fhir/mappers/practitioner'
import { createNewDocumentReferencePayload } from '@fhir/mappers/document-reference'
import { FhirDocumentReferenceBase, FhirPractitioner } from '@navikt/fhir-zod'
import { toReadableDatePeriod } from '@utils/date'
import { ExistingSykmelding } from '@services/syk-inn-api/SykInnApiSchema'

/**
 * Uses the FHIR client to fetch the Practitioner resource for the current user.
 *
 * With required hacks.
 */
export async function getPractitioner(client: ReadyClient): Promise<FhirPractitioner> {
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
                description: getSykmeldingDescription(sykmelding),
            },
            Buffer.from(pdfBuffer).toString('base64'),
        ),
    })

    if ('error' in createdDocumentReference) {
        return { error: 'API_ERROR' }
    }

    return createdDocumentReference
}

function getSykmeldingDescription(sykmelding: ExistingSykmelding): string {
    let type
    switch (sykmelding.aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            type = '100%'
            break
        case 'GRADERT':
            type = `${sykmelding.aktivitet.grad}%`
            break
    }

    return `${type} sykmelding, ${toReadableDatePeriod(sykmelding.aktivitet.fom, sykmelding.aktivitet.tom)}`
}
