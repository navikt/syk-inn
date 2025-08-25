import React, { ReactElement } from 'react'
import { after } from 'next/server'

import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { failServerSpan, spanServerAsync } from '@lib/otel/server'
import { getSmartClient } from '@data-layer/fhir/smart/smart-client'
import { getSessionId } from '@data-layer/fhir/smart/session'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'

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

            const client = await getSmartClient(sessionId, null).ready()
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
                const practitioner = await client.user.request()
                const patient = await client.patient.request()
                await client.encounter.request()

                span.setAttribute('non-pilot-user.dry-run.outcome', 'ok')

                await spanServerAsync('NonPilotUser.syk-inn-api', async (innerSpan) => {
                    if ('error' in practitioner || 'error' in patient) {
                        failServerSpan(innerSpan, 'Missing practitioner or patient resource')
                        return
                    }

                    const hpr = getHpr(practitioner.identifier)
                    const ident = getValidPatientIdent(patient.identifier)

                    if (hpr == null || ident == null) {
                        failServerSpan(innerSpan, 'Non-pilot-user missing HPR or patient identifier')
                        return
                    }

                    const sykmeldinger = await sykInnApiService.getSykmeldinger(ident, hpr)
                    if ('errorType' in sykmeldinger) {
                        failServerSpan(
                            innerSpan,
                            `Non-pilot-user failed to fetch sykmeldinger: ${sykmeldinger.errorType}`,
                        )
                        span.setAttribute('non-pilot-user.dry-run.sykmeldinger', 'fail')
                        return
                    }

                    span.setAttribute('non-pilot-user.dry-run.sykmeldinger', `${sykmeldinger.length}`)
                })
            })
        })
    })

    return <NonPilotUserWarning />
}

export default Page
