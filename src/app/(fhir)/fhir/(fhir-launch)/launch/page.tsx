import { ReactElement } from 'react'
import { cookies } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger'
import { redirect, RedirectType, unauthorized } from 'next/navigation'

import { getSmartClient } from '@data-layer/fhir/smart/smart-client'

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

    const launchResult = await getSmartClient(sessionId, null, false).launch({
        iss: issuerParam,
        launch,
    })

    if ('error' in launchResult) {
        logger.error(`Issuer ${issuerParam} launch failed, @navikt/smart-on-fhir says: ${launchResult.error}`)

        return <InvalidIssuer issuer={issuerParam} />
    }

    redirect(launchResult.redirectUrl, RedirectType.replace)
}

export default LaunchPage
