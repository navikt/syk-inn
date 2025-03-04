import { logger } from '@navikt/next-logger'

import { ensureValidFhirAuth } from '@fhir/auth/verify'
import {
    FhirDocumentReferenceResponse,
    FhirDocumentReferenceResponseSchema,
} from '@fhir/fhir-data/schema/documentReference'
import { sykInnApiService } from '@services/syk-inn-api/SykInnApiService'
import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'

type DocRefResponseResult = FhirDocumentReferenceResponse | [{ errors: { message: string } }]

export async function POST(request: Request): Promise<Response | DocRefResponseResult> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
    }

    const sykmeldingId = request.headers.get('sykmeldingId')
    if (sykmeldingId == null) {
        return new Response('Missing sykmeldingId header', { status: 400 })
    }

    const sykmeldingPdf = await sykInnApiService.getSykmeldingPdf(sykmeldingId)
    if ('errorType' in sykmeldingPdf) {
        return new Response('Failed to retrieve sykmelding pdf', { status: 500 })
    }

    // check if document reference already exists
    const existingDocumentReference = await serverFhirResources.getDocumentReference(sykmeldingId)

    const verifiedExistingDocRef = FhirDocumentReferenceResponseSchema.safeParse(existingDocumentReference)
    if (!verifiedExistingDocRef.success) {
        logger.error(`Invalid existing DocumentReference: ${JSON.stringify(verifiedExistingDocRef.error, null, 2)}`)

        return Response.json(
            [{ errors: { message: 'Invalid existing DocumentReference' } }] satisfies DocRefResponseResult,
            {
                status: 400,
            },
        )
    }

    if (existingDocumentReference) {
        return Response.json(verifiedExistingDocRef.data satisfies DocRefResponseResult)
    }

    // create document reference as it didn't exist
    const createdDocRef = await serverFhirResources.createDocumentReference(sykmeldingPdf.dokument, sykmeldingPdf.title)
    if ('errorType' in createdDocRef) {
        logger.error(`Failed to create DocumentReference: ${JSON.stringify(createdDocRef, null, 2)}`)

        return Response.json(
            [{ errors: { message: 'Failed to create DocumentReference' } }] satisfies DocRefResponseResult,
            {
                status: 500,
            },
        )
    }

    const verifiedCreatedDocRef = FhirDocumentReferenceResponseSchema.safeParse(createdDocRef)
    if (!verifiedCreatedDocRef.success) {
        logger.error(`Invalid created DocumentReference: ${JSON.stringify(verifiedCreatedDocRef.error, null, 2)}`)

        return Response.json(
            [{ errors: { message: 'Invalid created DocumentReference' } }] satisfies DocRefResponseResult,
            {
                status: 400,
            },
        )
    }

    return Response.json(verifiedCreatedDocRef.data satisfies DocRefResponseResult)
}

// function handleMockedRoute(): Response {
//     return Response.json({
//         resourceType: 'DocumentReference',
//         id: 'aa66036d-b63c-4c5a-b3d5-b1d1f812da8d',
//         meta: {
//             versionId: '1',
//             lastUpdated: '2025-03-04T03:21:36.880-05:00',
//         },
//     })
// }
