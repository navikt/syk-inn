import { unauthorized } from 'next/navigation'
import { logger as pinoLogger } from '@navikt/next-logger'

import { cleanPath } from '../utils'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

export async function POST(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)
    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)

    verifyAuthed(req)

    return mockedDocumentReference()
}

function verifyAuthed(req: Request): void {
    if (req.headers.get('Authorization') == null) {
        logger.warn('Mock resource was unauthed, 401ing >:(')
        unauthorized()
    }
}

function mockedDocumentReference(): Response {
    return Response.json(
        {
            resourceType: 'DocumentReference',
            id: 'aa66036d-b63c-4c5a-b3d5-b1d1f80000d',
            meta: {
                versionId: '1',
                lastUpdated: '2025-03-04T03:21:36.880-05:00',
            },
        },
        { status: 200 },
    )
}
