import { headers } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger'
import { ReactElement } from 'react'
import { redirect, RedirectType } from 'next/navigation'

import serverSmart from '@navikt/fhirclient-next'
import { getAbsoluteURL } from '@utils/url'
import { isKnownFhirServer, removeTrailingSlash } from '@fhir/issuers'
import { getFlag, getToggles } from '@toggles/unleash'
import { getFhirSessionStorage } from '@fhir/fhirclient-session'
import { getSessionId } from '@fhir/auth/session'
import { raise } from '@utils/ts'

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

    const sessionId = await getSessionId()
    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        return <MissingLaunchParams />
    }

    const params = await searchParams
    const issuerParam = params['iss']
    const launch = params['launch'] ? removeTrailingSlash(params['launch']) : null
    if (issuerParam == null || launch == null) {
        logger.error(`Invalid issuer or launch parameter ${issuerParam}, ${launch}`)
        return <MissingLaunchParams />
    }

    if (!isKnownFhirServer(issuerParam)) {
        logger.error(`Unknown issuer ${issuerParam}`)
        return <InvalidIssuer />
    }

    const redirectUrl = await serverSmart(await headers(), await getFhirSessionStorage()).authorize({
        clientId: 'syk-inn',
        scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
        iss: issuerParam,
        launch,
        redirect_uri: `${getAbsoluteURL()}/fhir/callback`,
        noRedirect: true,
    })

    if (typeof redirectUrl !== 'string') {
        raise('Expected redirectUrl to be a string, did you forget noRedirect?')
    }

    logger.info(`Redirecting to ${redirectUrl}`)
    redirect(redirectUrl, RedirectType.push)
}

export default LaunchPage
