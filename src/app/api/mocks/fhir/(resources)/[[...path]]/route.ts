import { logger as pinoLogger } from '@navikt/next-logger'
import { notFound, unauthorized } from 'next/navigation'

import { isE2E, isLocalOrDemo } from '@utils/env'

import data from '../data'
import { cleanPath } from '../utils'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

async function handler(req: Request): Promise<Response> {
    if (!isLocalOrDemo && !isE2E) {
        notFound()
    }

    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)
    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)
    const mockIdentifier = `${req.method} - ${fhirPath}`

    switch (mockIdentifier) {
        case 'GET - /Patient/cd09f5d4-55f7-4a24-a25d-a5b65c7a8805': {
            verifyAuthed(req)
            return Response.json(data.patient['Espen Eksempel'], { status: 200 })
        }
        case 'GET - /Practitioner/a1f1ed62-066a-4050-90f7-81e8f62eb3c2': {
            verifyAuthed(req)
            return Response.json(data.practitioner['Koman Magnar'], { status: 200 })
        }
        case 'GET - /Encounter/320fd29a-31b9-4c9f-963c-c6c88332d89a': {
            verifyAuthed(req)
            return Response.json(data.encounter['Espen hos Koman'], { status: 200 })
        }
        case 'GET - /.well-known/smart-configuration': {
            return Response.json(data.fhirServer.wellKnown, { status: 200 })
        }
        case 'GET - /metadata': {
            return Response.json(data.fhirServer.metadata, { status: 200 })
        }
        case 'GET - /keys': {
            return Response.json(await data.fhirServer.keys, { status: 200 })
        }
        default: {
            logger.error(`No mock found for ${mockIdentifier}`)
            return new Response(`Unimplemented FHIR resource: ${mockIdentifier}`, { status: 501 })
        }
    }
}

function verifyAuthed(req: Request): void {
    if (req.headers.get('Authorization') == null) {
        logger.warn('Mock resource was unauthed, 401ing >:(')
        unauthorized()
    }
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
}
