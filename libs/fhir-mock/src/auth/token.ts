import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { createAccessToken, createIdToken } from '../jwt/jwt'
import { fhirServerTestData } from '../meta/data/fhir-server'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export async function tokenExchange(request: HonoRequest): Promise<Response> {
    const body = await request.formData()
    const headers = request.header()

    try {
        await assertConfidentialClient(body, headers)
    } catch {
        return new Response('Confidential client assertion failed', { status: 403 })
    }

    if (body.has('code')) {
        logger.info(`Token exchange, got code`)
    } else {
        logger.error(`Token exchange, missing code`)
        return new Response('Missing code', { status: 400 })
    }

    return Response.json({
        access_token: await createAccessToken(fhirServerTestData.wellKnown().issuer),
        id_token: await createIdToken(),
        refresh_token: crypto.randomUUID(),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile launch fhirUser patient/*.* user/*.* offline_access',
        need_patient_banner: true,
        patient: 'cd09f5d4-55f7-4a24-a25d-a5b65c7a8805',
        encounter: '320fd29a-31b9-4c9f-963c-c6c88332d89a',
    })
}

export async function assertConfidentialClient(body: FormData, headers: Record<string, string>): Promise<void> {
    /**
     * Client secret basic
     */
    if (headers['authorization'] != null) {
        const [type, value] = headers['authorization'].split(' ')
        if (type !== 'Basic') {
            logger.error(`Authorization header is not Basic, was: ${headers['authorization']}`)
            throw new Error('Authorization header is not Basic')
        }

        const decodedValue = Buffer.from(value, 'base64').toString()
        if (decodedValue !== 'syk-inn:dev-mode-client-secret') {
            logger.error(`Authorization header does not match expected value, was: ${decodedValue}`)
            throw new Error('Authorization header does not match expected value')
        }

        // client_secret_basic is OK
        return
    }

    /**
     * Client secret post
     */
    const clientSecret = body.get('client_secret')?.toString()
    if (clientSecret != null) {
        if (clientSecret !== 'dev-mode-client-secret') {
            logger.error(`Client secret does not match expected value, was: ${clientSecret}`)
            throw new Error('Client secret does not match expected value')
        }

        // client_secret_post is OK
        return
    }

    throw new Error(
        'Not a confidential client, missing either client_secret_basic or client_secret_post configuration.',
    )
}
