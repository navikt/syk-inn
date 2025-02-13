import { notFound } from 'next/navigation'
import { logger as pinoLogger } from '@navikt/next-logger'

import { isE2E, isLocalOrDemo } from '@utils/env'

import data from './data'

const logger = pinoLogger.child({}, { msgPrefix: '[HELSEID-MOCK] ' })

async function handler(req: Request): Promise<Response> {
    if (!isLocalOrDemo && !isE2E) {
        notFound()
    }

    const url = new URL(req.url)
    const helseIdPath = cleanPath(url.pathname)

    logger.info(`Incoming request: ${req.method} - ${helseIdPath}`)

    const mockIdentifier = `${req.method} - ${helseIdPath}`
    switch (mockIdentifier) {
        case 'GET - /.well-known/openid-configuration': {
            return Response.json({
                issuer: 'http://localhost:3000/api/mocks/helseid',
                userinfo_endpoint: 'http://localhost:3000/api/mocks/helseid/connect/userinfo',
            })
        }
        case 'GET - /connect/userinfo': {
            return Response.json(data.behandler.userInfo)
        }
    }

    return new Response(`Unimplemented FHIR resource: ${mockIdentifier}`, { status: 501 })
}

function cleanPath(url: string): string {
    return url.replace(/.*\/mocks\/helseid/, '')
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
