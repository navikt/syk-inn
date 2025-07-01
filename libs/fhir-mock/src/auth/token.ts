import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { createAccessToken, createIdToken } from '../jwt/jwt'
import { fhirServerTestData } from '../meta/data/fhir-server'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export async function tokenExchange(request: HonoRequest): Promise<Response> {
    const body = await request.formData()

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
