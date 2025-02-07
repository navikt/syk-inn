import { redirect, RedirectType } from 'next/navigation'
import { calculatePKCECodeChallenge, randomPKCECodeVerifier } from 'openid-client'
import { cookies } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { isKnownFhirServer } from '@fhir/issuers'
import { getSessionStore } from '@fhir/sessions-secure/session-store'
import { WellKnownSchema } from '@fhir/sessions-secure/session-schema'

export async function GET(request: Request): Promise<Response> {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        return new Response('No valid session', { status: 401 })
    }

    const url = new URL(request.url)
    const issuer = url.searchParams.get('iss')
    const launch = url.searchParams.get('launch')
    if (issuer == null || launch == null || !isKnownFhirServer(issuer)) {
        // TODO: Mer spesifikk feilhåndtering
        redirect('/fhir/invalid-issuer')
    }

    const response = await fetch(`${issuer}/.well-known/smart-configuration`)
    if (!response.ok) {
        logger.error(`Issuer responded with ${response.status} ${response.statusText}`)
        return new Response('Internal server error', { status: 500 })
    }

    const result: unknown = await response.json()
    const validatedWellKnown = WellKnownSchema.safeParse(result)
    if (!validatedWellKnown.success) {
        logger.error(`Issuer ${issuer} responded with weird smart-configuration`, {
            cause: validatedWellKnown.error,
        })
        return new Response('Invalid well-known for issuer', { status: 400 })
    }

    const codeVerifier = randomPKCECodeVerifier()
    const sessionStore = await getSessionStore()
    await sessionStore.initializeSecureUserSession(sessionId, {
        issuer,
        codeVerifier,
        authorizationEndpoint: validatedWellKnown.data.authorization_endpoint,
        tokenEndpoint: validatedWellKnown.data.token_endpoint,
    })

    const authUrl = await getAuthUrl({
        issuer,
        authorizationEndpoint: validatedWellKnown.data.authorization_endpoint,
        codeVerifier,
        launch,
    })
    redirect(authUrl, RedirectType.replace)
}

async function getAuthUrl(opts: {
    issuer: string
    authorizationEndpoint: string
    codeVerifier: string
    launch: string
}): Promise<string> {
    const code_challenge = await calculatePKCECodeChallenge(opts.codeVerifier)
    const params = new URLSearchParams({
        client_id: 'syk-inn',
        response_type: 'code',
        scope: 'openid profile', // legg på launch seinare
        redirect_uri: 'http://localhost:3000/fhir/callback',
        code_challenge: code_challenge,
        audience: opts.issuer,
    })
    return `${opts.authorizationEndpoint}?${params.toString()}`
}
