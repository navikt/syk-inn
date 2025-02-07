import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { getSessionStore } from '@fhir/sessions-secure/session-store'
import { TokenResponseSchema } from '@fhir/sessions-secure/session-schema'

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (code == null) {
        redirect('/fhir/invalid-code')
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        return new Response('No valid session', { status: 401 })
    }

    // TODO: 1. Hente issuer/token, med code og verifier (ligger i redis)
    const sessionStore = await getSessionStore()
    const existingSession = await sessionStore.getSecurePartialSession(sessionId)

    const response = await fetch(existingSession.tokenEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client: 'syk-inn',
            grant_type: 'authorization_code',
            code,
            code_verifier: existingSession.codeVerifier,
        }),
    })

    if (!response.ok) {
        logger.error(`Token exchange failed, token_endpoint responed with ${response.status} ${response.statusText}`)
        return new Response('Token exchange failed', { status: 400 })
    }

    const result: unknown = await response.json()
    const parsedTokenResponse = TokenResponseSchema.safeParse(result)

    if (!parsedTokenResponse.success) {
        logger.error(`Issuer/token_endpoint ${existingSession.tokenEndpoint} responded with weird token response`, {
            cause: parsedTokenResponse.error,
        })
        return new Response('Token response failed', { status: 400 })
    }

    await sessionStore.completeSecureUserSession(sessionId, {
        idToken: parsedTokenResponse.data.id_token,
        accessToken: parsedTokenResponse.data.access_token,
        patient: parsedTokenResponse.data.patient,
        encounter: parsedTokenResponse.data.encounter,
    })

    // TODO: 2.5. verifisere jwt?

    redirect('/fhir')
}
