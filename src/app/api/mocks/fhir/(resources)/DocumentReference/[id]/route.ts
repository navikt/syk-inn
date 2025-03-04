//TODO her skal vi mocke shit for document ref get og post

import { unauthorized } from 'next/navigation'
import { logger as pinoLogger } from '@navikt/next-logger'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

export async function GET(request: Request): Promise<Response> {
    verifyAuthed(request)
    return mockedDocumentReference()
}

export async function POST(request: Request): Promise<Response> {
    verifyAuthed(request)
    return mockedDocumentReference()
}

function verifyAuthed(req: Request): void {
    if (req.headers.get('Authorization') == null) {
        logger.warn('Mock resource was unauthed, 401ing >:(')
        unauthorized()
    }
}

function mockedDocumentReference(): Response {
    return Response.json({
        resourceType: 'DocumentReference',
        id: 'aa66036d-b63c-4c5a-b3d5-b1d1f812da8d',
        meta: {
            versionId: '1',
            lastUpdated: '2025-03-04T03:21:36.880-05:00',
        },
    })
}
