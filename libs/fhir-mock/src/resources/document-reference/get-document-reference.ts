import { HonoRequest } from 'hono'

import { fhirLogger } from '../../logger'

const shouldReturn = true

export async function getDocumentReference(_: HonoRequest, docRefId: string): Promise<Response> {
    fhirLogger.info(`Incoming request: GET DocumentReference/${docRefId}`)

    if (!shouldReturn) {
        fhirLogger.info("Pretending document reference doesn't exist")
        return new Response('Not found', { status: 404 })
    }

    return mockedDocumentReference()
}

function mockedDocumentReference(): Response {
    return Response.json(
        {
            resourceType: 'DocumentReference',
            id: 'aa66036d-b63c-4c5a-b3d5-b1d1f871337c',
            meta: {
                versionId: '1',
                lastUpdated: '2025-03-04T03:21:36.880-05:00',
            },
        },
        { status: 200 },
    )
}
