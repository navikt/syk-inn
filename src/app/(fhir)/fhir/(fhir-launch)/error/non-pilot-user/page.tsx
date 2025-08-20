import React, { ReactElement } from 'react'
import { after } from 'next/server'

import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { failServerSpan, spanServerAsync } from '@lib/otel/server'
import { getSmartClient } from '@data-layer/fhir/smart/smart-client'
import { getSessionId } from '@data-layer/fhir/smart/session'

async function Page(): Promise<ReactElement> {
    const sessionId = await getSessionId()

    after(async () => {
        /**
         * We use this page to dry-run a couple of resources to verify that FHIR is configured and backend is reachable,
         * without exposing any data to the end-user.
         */
        await spanServerAsync('NonPilotUser.dry-run', async (span) => {
            if (sessionId == null) {
                failServerSpan(
                    span,
                    'Non-pilot-user without sessionId',
                    new Error('User was redirected to non-pilot-error page without session Id.'),
                )
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }

            const client = await getSmartClient(sessionId, null, false).ready()
            if ('error' in client) {
                failServerSpan(span, `Non-pilot-user failed ready: ${client.error}`)
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }
            if (!(await client.validate())) {
                failServerSpan(span, 'Non-pilot-user failed token validation')
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }

            await spanServerAsync('NonPilotUser.resources', async () => {
                await client.user.request()
                await client.patient.request()
                await client.encounter.request()

                span.setAttribute('non-pilot-user.dry-run.outcome', 'ok')
            })
        })
    })

    return <NonPilotUserWarning />
}

export default Page
