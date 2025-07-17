import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { createAccessToken, createIdToken } from '../jwt/jwt'
import { fhirServerTestData } from '../meta/data/fhir-server'
import { FhirClient, getConfig } from '../config'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export async function tokenExchange(request: HonoRequest): Promise<Response> {
    const body = await request.formData()
    const headers = request.header()

    const clientId = body.get('client_id')?.toString()
    const client = getConfig().clients.find((it) => it.clientId == clientId)
    if (client == null) {
        logger.error(`Token exchange, invalid client_id: ${clientId}`)
        return Response.json(
            { error: 'invalid_client', error_description: 'Client authentication failed' },
            {
                status: 401,
                headers: {
                    'WWW-Authenticate':
                        'Basic realm="oauth", error="invalid_client", error_description="Client authentication failed"',
                },
            },
        )
    }

    try {
        await assertConfidentialClient(body, headers, client)
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

export async function assertConfidentialClient(
    body: FormData,
    headers: Record<string, string>,
    client: FhirClient,
): Promise<void> {
    switch (client.method) {
        case 'client_secret_basic':
            if (headers['authorization'] == null) {
                throw new Error(
                    `Client ${client.clientId} was client_secret_basic, but no authorization header was provided.`,
                )
            }
            const [type, value] = headers['authorization'].split(' ')
            if (type !== 'Basic') {
                logger.error(`Authorization header is not Basic, was: ${headers['authorization']}`)
                throw new Error('Authorization header is not Basic')
            }

            const decodedValue = Buffer.from(value, 'base64').toString()
            if (decodedValue !== `${client.clientId}:${client.clientSecret}`) {
                logger.error(`Authorization header does not match expected value, was: ${decodedValue}`)
                throw new Error('Authorization header does not match expected value')
            }

            // client_secret_basic is OK
            return

        case 'client_secret_post':
            const clientSecret = body.get('client_secret')?.toString()
            if (clientSecret == null) {
                logger.error(
                    `Client ${client.clientId} was client_secret_post, but no client_secret was provided in body.`,
                )
                throw new Error('Client secret is required for client_secret_post')
            }

            if (clientSecret !== client.clientSecret) {
                logger.error(`Client secret does not match expected value, was: ${clientSecret}`)
                throw new Error('Client secret does not match expected value')
            }
            // client_secret_post is OK
            return
        default: {
            throw new Error(`Unknown client method: "${client.method}"`)
        }
    }
}
