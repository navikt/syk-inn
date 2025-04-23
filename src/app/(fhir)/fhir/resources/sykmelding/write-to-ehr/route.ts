import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'
import { getReadyClient } from '@fhir/smart-client'

import { WriteToEhrResult } from '../../../../../../data-fetcher/data-service'

type WriteToEhrResponse = WriteToEhrResult | { errors: [{ message: string }] }

export async function POST(request: Request): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        if (client.error === 'INVALID_TOKEN') {
            logger.error('Session expired or invalid token')
            return new Response('Unauthorized', { status: 401 })
        }

        logger.error(`Failed to instantiate SmartClient(ReadyClient), reason: ${client.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    const sykmeldingId = request.headers.get('sykmeldingId')
    if (sykmeldingId == null) {
        logger.error('Missing sykmeldingId header')
        return new Response('Missing sykmeldingId header', { status: 400 })
    }

    // TODO: Don't use HPR header, use the HPR from the token instead
    const hpr = request.headers.get('HPR')
    if (hpr == null) {
        logger.error('Missing HPR header')
        return new Response('Missing HPR header', { status: 400 })
    }

    const sykmeldingPdfArrayBuffer = await sykInnApiService.getSykmeldingPdf(sykmeldingId, hpr)
    if ('errorType' in sykmeldingPdfArrayBuffer) {
        logger.error(`Failed to retrieve sykmelding pdf ${sykmeldingPdfArrayBuffer.errorType}`)
        return new Response('Failed to retrieve sykmelding pdf', { status: 500 })
    }
    const sykmeldingBase64 = Buffer.from(sykmeldingPdfArrayBuffer).toString('base64')

    const existingDocumentReference = await serverFhirResources.getDocumentReference(sykmeldingId)
    if ('resourceType' in existingDocumentReference && existingDocumentReference.resourceType === 'DocumentReference') {
        return Response.json({
            outcome: 'ALREADY_EXISTS',
            documentReference: existingDocumentReference,
        } satisfies WriteToEhrResult)
    }

    if ('errorType' in existingDocumentReference && existingDocumentReference.errorType === 'INVALID_FHIR_RESPONSE') {
        logger.error(new Error(existingDocumentReference.errorType))
        return Response.json(
            { errors: [{ message: existingDocumentReference.errorType }] } satisfies WriteToEhrResponse,
            {
                status: 400,
            },
        )
    }

    // Doesn't already exist, and hasn't returned invalid FHIR response, we can try and create it
    const createdDocRef = await serverFhirResources.createDocumentReference(
        sykmeldingBase64,
        'Sykmelding title goes here',
        sykmeldingId,
    ) // TODO title
    if ('error' in createdDocRef) {
        logger.error(new Error(createdDocRef.error))
        return Response.json({ errors: [{ message: createdDocRef.error }] } satisfies WriteToEhrResponse, {
            status: 500,
        })
    }

    return Response.json({
        outcome: 'NEWLY_CREATED',
        documentReference: createdDocRef,
    } satisfies WriteToEhrResult)
}
