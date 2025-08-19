import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

const shouldReturn = true

export async function getDocumentReference(_: HonoRequest, docRefId: string): Promise<Response> {
    logger.info(`Incoming request: GET DocumentReference/${docRefId}`)

    if (!shouldReturn) {
        logger.info("Pretending document reference doesn't exist")
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
