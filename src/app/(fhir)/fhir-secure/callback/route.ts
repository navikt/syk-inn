import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger'

import { getSessionStore } from '@fhir/sessions-secure/session-store'
import { TokenResponseSchema } from '@fhir/sessions-secure/session-schema'
import { getAbsoluteURL, pathWithBasePath } from '@utils/url'

const logger = pinoLogger.child({}, { msgPrefix: '[Secure FHIR (callback)] ' })

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url)
    /**
     * PKCE STEP 4
     * Authorization server stores the code_challenge and redirects the user back to the application with an authorization code, which is good for one use.
     */
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (code == null || state == null) {
        logger.warn(`Missing code or state parameter in callback request code: ${code == null} state: ${state == null}`)
        redirect(pathWithBasePath('/fhir/invalid-code'))
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

    if (existingSession.state !== state) {
        logger.warn(`State mismatch, expected ${existingSession.state.length} but got ${state.length}`)
        return new Response('State validation failed', { status: 401 })
    }

    logger.info(`Exchanging code for token with issuer ${existingSession.tokenEndpoint}`)

    /**
     * PKCE STEP 5
     * Send code and the code_verifier (created in step 1) to the authorization servers /oauth/token endpoint.
     */
    const formUrlEncodedBody = new URLSearchParams({
        client_id: 'syk-inn',
        grant_type: 'authorization_code',
        code,
        code_verifier: existingSession.codeVerifier,
        redirect_uri: `${getAbsoluteURL()}/fhir/callback`, // TODO trailing slash?
    })

    logger.info(`Token request body: ${formUrlEncodedBody.toString()}`)

    const response = await fetch(existingSession.tokenEndpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formUrlEncodedBody,
    })

    /**
     * PKCE STEP 5
     * Authorization server verifies the code_challenge and code_verifier.
     * Upon successful verification the authorization server issues id_token, access_token and (optional) refresh_token.
     */
    if (!response.ok) {
        logger.error(`Token exchange failed, token_endpoint responed with ${response.status} ${response.statusText}`)
        if (response.headers.get('Content-Type')?.includes('text/plain')) {
            const text = await response.text()
            logger.error(`Token exchange failed with text: ${text}`)
        } else if (response.headers.get('Content-Type')?.includes('application/json')) {
            const json = await response.json()
            logger.error(`Token exchange failed with json: ${JSON.stringify(json)}`)
        }
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

    redirect(pathWithBasePath('/fhir'))
}
