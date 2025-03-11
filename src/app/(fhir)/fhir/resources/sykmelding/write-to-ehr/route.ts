import { logger } from '@navikt/next-logger'

import { ensureValidFhirAuth } from '@fhir/auth/verify'
import { FhirDocumentReferenceBaseSchema } from '@fhir/fhir-data/schema/documentReference'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'

import { WriteToEhrResult } from '../../../../../../data-fetcher/data-service'

type WriteToEhrResponse = WriteToEhrResult | { errors: [{ message: string }] }

export async function POST(request: Request): Promise<Response> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
    }

    const sykmeldingId = request.headers.get('sykmeldingId')
    if (sykmeldingId == null) {
        logger.error('Missing sykmeldingId header')
        return new Response('Missing sykmeldingId header', { status: 400 })
    }

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
    if ('outcome' in existingDocumentReference) {
        return Response.json(existingDocumentReference satisfies WriteToEhrResult)
    }

    if ('errorType' in existingDocumentReference && existingDocumentReference.errorType === 'INVALID_FHIR_RESPONSE') {
        logger.error(new Error(existingDocumentReference.errorType, { cause: existingDocumentReference.zodErrors }))
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
        'Sykmelding for Foo Bar',
        sykmeldingId,
    ) // TODO title
    if ('errorType' in createdDocRef) {
        logger.error(new Error(createdDocRef.errorType, { cause: createdDocRef.zodErrors }))
        return Response.json({ errors: [{ message: createdDocRef.errorType }] } satisfies WriteToEhrResponse, {
            status: 500,
        })
    }

    const verifiedCreatedDocRef = FhirDocumentReferenceBaseSchema.safeParse(createdDocRef)
    if (!verifiedCreatedDocRef.success) {
        logger.error(`Invalid created DocumentReference: ${JSON.stringify(verifiedCreatedDocRef.error, null, 2)}`)

        return Response.json({ errors: [verifiedCreatedDocRef.error] } satisfies WriteToEhrResponse, {
            status: 400,
        })
    }

    return Response.json({
        outcome: 'NEWLY_CREATED',
        documentReference: verifiedCreatedDocRef.data,
    } satisfies WriteToEhrResult)
}
