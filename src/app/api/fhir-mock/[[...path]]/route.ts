import { logger as pinoLogger } from '@navikt/next-logger'

import data from './data'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK] ' })

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)

    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)

    const mockIdentifier = `${req.method} - ${fhirPath}`
    switch (mockIdentifier) {
        case 'GET - /Patient': {
            return Response.json(data.pasient['Espen Eksempel'], { status: 200 })
        }
        case 'GET - /.well-known/smart-configuration': {
            return Response.json(data.fhirServer.wellKnown, { status: 200 })
        }
        case 'GET - /metadata': {
            return Response.json(data.fhirServer.metadata, { status: 200 })
        }
        default: {
            logger.error(`No mock found for ${mockIdentifier}`)
            return new Response(`Unimplemented FHIR resource: ${mockIdentifier} (${req.method})`, { status: 501 })
        }
    }
}

function cleanPath(url: string): string {
    return url.replace(/.*\/fhir-mock/, '')
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
