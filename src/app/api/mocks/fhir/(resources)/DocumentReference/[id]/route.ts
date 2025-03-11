import { logger as pinoLogger } from '@navikt/next-logger'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

const shouldReturn = false

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function GET(_: Request, { params }: RouteParams): Promise<Response> {
    const docRefId = (await params).id

    logger.info(`Incoming request: GET DocumentReference/${docRefId}`)

    // verifyAuthed(req)
    if (!shouldReturn) {
        logger.info("Pretending document reference doesn't exist")
        return new Response('Not found', { status: 404 })
    }

    return mockedDocumentReference()
}

// function verifyAuthed(req: Request): void {
//     if (req.headers.get('Authorization') == null) {
//         logger.warn('Mock resource was unauthed, 401ing >:(')
//         unauthorized()
//     }
// }

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
