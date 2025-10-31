import React, { ReactElement } from 'react'
import { after } from 'next/server'
import { logger } from '@navikt/next-logger'

import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getSmartClient } from '@data-layer/fhir/smart/smart-client'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { getOrganisasjonstelefonnummerFromFhir } from '@data-layer/fhir/mappers/organization'
import { getSessionId } from '@core/session/session'

const SYK_INN_API_DEPLOYED_IN_PROD = false

async function Page(): Promise<ReactElement> {
    const sessionId = await getSessionId()

    after(async () => {
        /**
         * We use this page to dry-run a couple of resources to verify that FHIR is configured and backend is reachable,
         * without exposing any data to the end-user.
         */
        await spanServerAsync('NonPilotUser.dry-run', async (span) => {
            if (sessionId == null) {
                failSpan(
                    span,
                    'Non-pilot-user without sessionId',
                    new Error('User was redirected to non-pilot-error page without session Id.'),
                )
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }

            const client = await getSmartClient(sessionId, null).ready()
            if ('error' in client) {
                failSpan(span, `Non-pilot-user failed ready: ${client.error}`)
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }
            if (!(await client.validate())) {
                failSpan(span, 'Non-pilot-user failed token validation')
                span.setAttribute('non-pilot-user.dry-run.outcome', 'fail')
                return
            }

            await spanServerAsync('NonPilotUser.resources', async () => {
                const practitioner = await client.user.request()
                const patient = await client.patient.request()
                const encounter = await client.encounter.request()
                await client.request(`Condition?encounter=${client.encounter.id}`)
                if (!('error' in encounter)) {
                    const organization = await client.request(
                        encounter.serviceProvider.reference as `Organization/${string}`,
                    )

                    if (!('error' in organization)) {
                        const legekontorTlf = getOrganisasjonstelefonnummerFromFhir(organization)
                        if (legekontorTlf == null) {
                            logger.error(
                                `Organization without valid phone number, but we found ${organization.telecom.map((it) => it.system).join(', ')}`,
                            )
                        }
                    }
                }

                span.setAttribute('non-pilot-user.dry-run.outcome', 'ok')

                await spanServerAsync('NonPilotUser.syk-inn-api', async (innerSpan) => {
                    if ('error' in practitioner || 'error' in patient) {
                        failSpan(innerSpan, 'Missing practitioner or patient resource')
                        return
                    }

                    const hpr = getHpr(practitioner.identifier)
                    const ident = getValidPatientIdent(patient.identifier)

                    if (hpr == null || ident == null) {
                        failSpan(innerSpan, 'Non-pilot-user missing HPR or patient identifier')
                        return
                    }

                    if (SYK_INN_API_DEPLOYED_IN_PROD) {
                        const sykmeldinger = await sykInnApiService.getSykmeldinger(ident, hpr)
                        if ('errorType' in sykmeldinger) {
                            failSpan(
                                innerSpan,
                                `Non-pilot-user failed to fetch sykmeldinger: ${sykmeldinger.errorType}`,
                            )
                            span.setAttribute('non-pilot-user.dry-run.sykmeldinger', 'fail')
                            return
                        }

                        span.setAttribute('non-pilot-user.dry-run.sykmeldinger', `${sykmeldinger.length}`)
                    }
                })
            })
        })
    })

    return <NonPilotUserWarning />
}

export default Page
