import { logger as pinoLogger } from '@navikt/next-logger/dist/logger'

import { getAbsoluteURL } from '@utils/url'

import { createToken } from '../../jwt'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

async function handler(req: Request): Promise<Response> {
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

            const token = await createToken()
            return Response.redirect(`${redirectUri}?code=${token}`, 302)
        }
        case 'POST - /auth/token': {
            const body = await req.formData()
            return Response.json({
                access_token: body.get('code'),
                token_type: 'Bearer',
                expires_in: 3600,
                scope: 'patient/*.read launch',
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
