import { cookies } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger/dist/logger'
import { redirect, RedirectType, unauthorized } from 'next/navigation'
import { calculatePKCECodeChallenge, randomPKCECodeVerifier } from 'openid-client'

import { isKnownFhirServer, removeTrailingSlash } from '@fhir/issuers'
import { WellKnownSchema } from '@fhir/sessions-secure/session-schema'
import { getSessionStore } from '@fhir/sessions-secure/session-store'
import { getAbsoluteURL } from '@utils/url'

type Props = {
    searchParams: Promise<{ iss: string; launch: string }>
}

const logger = pinoLogger.child({}, { msgPrefix: '[Secure FHIR] ' })

/**
 * This should in theory be able to be a route handler, but cookies set in middleware are not propagated to the handler
 * when the handler is within the same HTTP request. But server components have access to cookies set in middleware.
 */
async function HackyPageAsRouteHandler({ searchParams }: Props): Promise<null> {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        unauthorized()
    }

    const params = await searchParams
    const issuerParam = params['iss']
    const launch = params['launch']
    if (issuerParam == null || launch == null || !isKnownFhirServer(issuerParam)) {
        logger.error(`Invalid issuer or launch parameter ${issuerParam}, ${launch}`)
        // TODO: Mer spesifikk feilhåndtering
        redirect('/fhir/invalid-issuer')
    }

    const issuer = removeTrailingSlash(issuerParam)
    const smartConfigurationUrl = `${issuer}/.well-known/smart-configuration`
    logger.info(`Fetching smart-configuration from ${smartConfigurationUrl}`)

    const response = await fetch(smartConfigurationUrl)
    if (!response.ok) {
        logger.error(`Issuer responded with ${response.status} ${response.statusText}`)
        throw new Error('Internal server error')
    }

    const result: unknown = await response.json()
    const validatedWellKnown = WellKnownSchema.safeParse(result)
    if (!validatedWellKnown.success) {
        logger.error(`Issuer ${issuer} responded with weird smart-configuration`, {
            cause: validatedWellKnown.error,
        })

        // Redirect?
        throw new Error('Invalid well-known for issuer')
    }

    logger.info(`Issuer ${issuer} validated, creating secure session`)
    const codeVerifier = randomPKCECodeVerifier()
    const sessionStore = await getSessionStore()
    await sessionStore.initializeSecureUserSession(sessionId, {
        issuer,
        codeVerifier,
        authorizationEndpoint: validatedWellKnown.data.authorization_endpoint,
        tokenEndpoint: validatedWellKnown.data.token_endpoint,
    })

    logger.info(`Redirecting to authorization endpoint`)
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
        response_type: 'code',
        client_id: 'syk-inn',
        scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
        redirect_uri: `${getAbsoluteURL()}/fhir/callback`,
        audience: opts.issuer,
        launch: opts.launch,
        code_challenge: code_challenge,
        code_challenge_method: 'S256',
    })
    return `${opts.authorizationEndpoint}?${params.toString()}`
}

export default HackyPageAsRouteHandler
