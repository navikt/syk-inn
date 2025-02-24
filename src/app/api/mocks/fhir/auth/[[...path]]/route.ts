import { randomUUID } from 'node:crypto'

import { logger as pinoLogger } from '@navikt/next-logger'
import { notFound } from 'next/navigation'

import { getAbsoluteURL } from '@utils/url'
import { isE2E, isLocalOrDemo } from '@utils/env'

import { createAccessToken, createIdToken } from '../../jwt'
import testData from '../../(resources)/data'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

async function handler(req: Request): Promise<Response> {
    if (!isLocalOrDemo && !isE2E) {
        notFound()
    }

    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)

    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)

    const mockIdentifier = `${req.method} - ${fhirPath}`
    switch (mockIdentifier) {
        case 'GET - /auth/authorize': {
            logger.info(
                `/auth/authorize request with params: \n\t${Array.from(url.searchParams.entries()).join('\n\t')}`,
            )

            const redirectUri = url.searchParams.get('redirect_uri')
            if (!redirectUri) {
                return new Response('Missing redirect_uri', { status: 400 })
            }

            const state = url.searchParams.get('state')
            if (!state) {
                return new Response('Missing state', { status: 400 })
            }

            const notAToken = randomUUID()
            const redirectUrl = `${redirectUri}?code=${notAToken}&state=${state}`

            logger.info(`/auth/authorize good, redirecting to ${redirectUrl}`)
            return Response.redirect(redirectUrl, 302)
        }
        case 'POST - /auth/token': {
            const body = await req.formData()

            logger.info(`Got code=${body.get('code')}`)

            return Response.json({
                access_token: await createAccessToken(testData.fhirServer.wellKnown.issuer),
                id_token: await createIdToken(),
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'openid profile launch fhirUser patient/*.* user/*.* offline_access',
                need_patient_banner: true,
                smart_style_url: `${getAbsoluteURL()}/api/fhir/smart-style.json`,
                patient: 'cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
                encounter: '320fd29a-31b9-4c9f-963c-c6c88332d89a',
            })
        }
    }

    return new Response(`Auth mock not implemented for ${req.method} - ${fhirPath}`, { status: 501 })
}

function cleanPath(url: string): string {
    return url.replace(/.*\/mocks\/fhir/, '')
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
