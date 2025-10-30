import { HonoRequest } from 'hono'

import { createAccessToken, createIdToken } from '../jwt/jwt'
import { fhirServerTestData } from '../meta/data/fhir-server'
import { FhirClient, getConfig, getServerSession } from '../config'
import { fhirLogger } from '../logger'

export async function tokenExchange(request: HonoRequest): Promise<Response> {
    const body = await request.formData()
    const headers = request.header()

    const clientId = body.get('client_id')?.toString()
    const client = getConfig().clients.find((it) => it.clientId == clientId)
    if (client == null) {
        fhirLogger.error(`Token exchange, invalid client_id: ${clientId}`)
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
    } catch (error) {
        fhirLogger.error(new Error('Confidential client assertion failed', { cause: error }))
        return new Response('Confidential client assertion failed', { status: 403 })
    }

    const code = body.get('code')
    if (code == null || typeof code !== 'string') {
        fhirLogger.error(`Token exchange, missing code`)
        return new Response('Missing code', { status: 400 })
    }

    const accessToken = await createAccessToken(fhirServerTestData.wellKnown().issuer, code)
    const session = getServerSession().completeLaunch(code, accessToken)
    const idToken = await createIdToken(session.practitioner.id, {
        'https://helseid.nhn.no': {
            access_token: await createAccessToken('https://helseid.nhn.no', crypto.randomUUID()),
            issuer: 'https://helseid.nhn.no',
            scope: 'nav:syk-inn',
        },
    })

    fhirLogger.warn(
        `Launch complete! \npatient: ${session.patient.id}\nencounter: ${session.encounter.id}\npractitioner: ${session.practitioner.id}\norganization: ${session.organization.id}`,
    )

    return Response.json({
        access_token: accessToken,
        id_token: idToken,
        patient: session.patient.id,
        encounter: session.encounter.id,
        refresh_token: crypto.randomUUID(),
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile launch fhirUser patient/*.* user/*.* offline_access',
        need_patient_banner: true,
    })
}

async function assertConfidentialClient(
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
                throw new Error(`Authorization header is not Basic, was: ${headers['authorization']}`)
            }

            const decodedValue = Buffer.from(value, 'base64').toString()
            if (decodedValue !== `${client.clientId}:${client.clientSecret}`) {
                throw new Error(`Authorization header does not match expected value, was: ${decodedValue}`)
            }

            // client_secret_basic is OK
            return

        case 'client_secret_post':
            const clientSecret = body.get('client_secret')?.toString()
            if (clientSecret == null) {
                throw new Error(
                    `Client "${client.clientId}", secret is required for client_secret_post, but was not provided in the body.`,
                )
            }

            if (clientSecret !== client.clientSecret) {
                throw new Error(`Client secret does not match expected value, was: ${clientSecret}`)
            }

            // client_secret_post is OK
            return
        default: {
            throw new Error(`Unknown client method: "${client.method}"`)
        }
    }
}
