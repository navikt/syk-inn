import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { logger as pinoLogger } from '@navikt/next-logger'

import { pathWithBasePath } from '@utils/url'
import { getSmartClient } from '@fhir/smart/smart-client'

const logger = pinoLogger.child({}, { msgPrefix: '[Secure FHIR (callback)] ' })

/**
 * Third step in launch process, after the user followed the authorizanion_url and is redirected here with a code and
 * our state param. We exchange this together with PKCE for tokens and update the users session.
 */
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
        redirect(pathWithBasePath('/fhir/error?reason=invalid-code'))
    }

    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)

        redirect(pathWithBasePath('/fhir/error?reason=unknown'))
    }

    const callback = await getSmartClient(sessionId).callback({ code, state })
    if ('error' in callback) {
        logger.error(`Callback failed with error ${callback.error}`)

        redirect(pathWithBasePath('/fhir/error?reason=callback-failed'))
    }

    redirect(callback.redirect_url)
}
