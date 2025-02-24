import { cookies } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger'
import { redirect, RedirectType, unauthorized } from 'next/navigation'
import { calculatePKCECodeChallenge, randomPKCECodeVerifier, randomState } from 'openid-client'
import { ReactElement } from 'react'

import { getAbsoluteURL } from '@utils/url'
import { isKnownFhirServer, removeTrailingSlash } from '@fhir/issuers'
import { WellKnownSchema } from '@fhir/sessions/session-schema'
import { getSessionStore } from '@fhir/sessions/session-store'
import { getFlag, getToggles } from '@toggles/unleash'

import { InvalidIssuer, MissingLaunchParams } from '../launch-errors'

type Props = {
    searchParams: Promise<{ iss: string; launch: string }>
}

const logger = pinoLogger.child({}, { msgPrefix: '[Secure FHIR] ' })

/**
 * Initial SMART on FHIR launch, the EHR system provides a issuer (their own FHIR server) and a launch parameter.
 *
 * We initialize a session and generate a authorization_url that we redirect the user to.
 */
async function LaunchPage({ searchParams }: Props): Promise<ReactElement> {
    const debugWait = getFlag('SYK_INN_DEBUG_WAIT_BEFORE_LAUNCH', await getToggles())
    if (debugWait.enabled) {
        logger.warn('Debug wait enabled, waiting 10 seconds before launching')
        await new Promise((resolve) => setTimeout(resolve, 10000))
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        // TODO: Just render error state since this is RSC?
        unauthorized()
    }

    const params = await searchParams
    const issuerParam = params['iss']
    const launch = params['launch']
    if (issuerParam == null || launch == null) {
        logger.error(`Invalid issuer or launch parameter ${issuerParam}, ${launch}`)
        return <MissingLaunchParams />
    }

    if (!isKnownFhirServer(issuerParam)) {
        logger.error(`Unknown issuer ${issuerParam}`)
        return <InvalidIssuer />
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

        // TODO: Just render error state since this is RSC?
        // Redirect?
        throw new Error('Invalid well-known for issuer')
    }

    logger.info(`Issuer ${issuer} validated, creating secure session`)

    /**
     * PKCE STEP 1
     * Create a cryptographically-random code_verifier
     */
    const codeVerifier = randomPKCECodeVerifier()
    const state = randomState()
    const sessionStore = await getSessionStore()
    await sessionStore.initializeUserSession(sessionId, {
        issuer,
        codeVerifier,
        state,
        authorizationEndpoint: validatedWellKnown.data.authorization_endpoint,
        tokenEndpoint: validatedWellKnown.data.token_endpoint,
    })

    logger.info(`Redirecting to authorization endpoint`)
    const authUrl = await getAuthUrl({
        issuer,
        authorizationEndpoint: validatedWellKnown.data.authorization_endpoint,
        codeVerifier,
        state,
        launch,
    })

    // TODO: Don't log auth URL
    logger.debug(`Redirecting to: ${authUrl}`)
    /**
     * PKCE STEP 3
     * Redirect the user to the /authorize endpoint along with the code_challenge
     */
    redirect(authUrl, RedirectType.replace)
}

async function getAuthUrl(opts: {
    issuer: string
    authorizationEndpoint: string
    codeVerifier: string
    state: string
    launch: string
}): Promise<string> {
    /**
     * PKCE STEP 2
     * Generate a code_challenge from the code_verifier in step 1
     */
    const code_challenge = await calculatePKCECodeChallenge(opts.codeVerifier)
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: 'syk-inn',
        scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
        redirect_uri: `${getAbsoluteURL()}/fhir/callback`,
        aud: opts.issuer,
        launch: opts.launch,
        state: opts.state,
        code_challenge: code_challenge,
        code_challenge_method: 'S256',
    })
    return `${opts.authorizationEndpoint}?${params.toString()}`
}

export default LaunchPage
