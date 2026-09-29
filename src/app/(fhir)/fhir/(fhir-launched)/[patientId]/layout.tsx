import { logger } from '@navikt/next-logger'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React, { ReactElement } from 'react'

import { NoValidHPR } from '#components/errors/NoValidHPR'
import { FeedbackButton } from '#components/feedback/FeedbackButton'
import { LoggedOutWarning } from '#components/user-warnings/LoggedOutWarning'
import { getHelseIdBehandler, validateHelseIdAccessToken } from '#core/auth/helseid/helseid'
import { createFhirPaths } from '#core/providers/ModePaths'
import { FhirModeProvider } from '#core/providers/Modes'
import { Providers } from '#core/providers/Providers'
import { AutoPatient } from '#core/redux/reducers/ny-sykmelding/patient'
import { hasAcceptedBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { ToggleProvider } from '#core/toggles/context'
import { getFlag, getUserToggles, toToggleMap } from '#core/toggles/unleash'
import { getBehandler, getPasient, isResourceError } from '#data-layer/fhir/resources/fhir-resources-service'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { LazyDevTools } from '#dev/tools/LazyDevTools'
import { isDemo, isDevGcp, isLocal } from '#lib/env'
import { failSpan, spanServerAsync } from '#lib/otel/server'
import metrics from '#lib/prometheus/metrics'

import { NoHelseIdInFhirSession, NoPractitionerSession, NoValidPatient } from './launched-errors'

/**
 * Any FHIR launched session requires a practitioner with a valid HPR, and a patient with a valid ident.
 *
 * This layout fetches required data and renders any specific error. The happy path will initialize the Providers
 * with the fetched patient and feature toggles. In FHIR mode the patient can never be changed without launching
 * again, so the redux state will never be updated.
 */
async function LaunchedLayout({ children, params }: LayoutProps<'/fhir/[patientId]'>): Promise<ReactElement> {
    const patientId = (await params).patientId
    const rootFhirData = await getRootFhirData(patientId)

    if ('error' in rootFhirData) {
        metrics.appLoadErrorsTotal.inc({ mode: 'FHIR', error_type: rootFhirData.error })

        switch (rootFhirData.error) {
            case 'NO_HPR':
                return <NoValidHPR />
            case 'NO_SESSION':
                return <NoPractitionerSession />
            case 'NO_HELSEID':
                return <NoHelseIdInFhirSession />
            case 'NO_PATIENT':
                return <NoValidPatient />
        }
    }

    return (
        <FhirModeProvider activePatientId={patientId}>
            <Providers patient={rootFhirData.pasient} graphqlPath={createFhirPaths(patientId).graphql}>
                <ToggleProvider toggles={toToggleMap(rootFhirData.toggles)}>
                    {children}
                    <LoggedOutWarning />
                    {(isLocal || isDemo) && <LazyDevTools />}
                    {!isDemo && <FeedbackButton />}
                    {(isLocal || isDevGcp) && (
                        <div className="fixed bottom-2 left-2">
                            <Link href={`/fhir/${patientId}/validator`} className="underline text-sm">
                                SoF rapport
                            </Link>
                        </div>
                    )}
                </ToggleProvider>
            </Providers>
        </FhirModeProvider>
    )
}

type RootFhirData =
    | {
          error: 'NO_HPR' | 'NO_SESSION' | 'NO_HELSEID' | 'NO_PATIENT'
      }
    | {
          pasient: AutoPatient
          acceptedBruksvilkarAt: string | null
          toggles: Awaited<ReturnType<typeof getUserToggles>>
      }

async function getRootFhirData(currentPatientId: string): Promise<RootFhirData> {
    return await spanServerAsync('FHIR.getRootFhirData', async (span) => {
        const readyClient = await getReadyClient(currentPatientId)
        if ('error' in readyClient) {
            failSpan.silently(span, readyClient.error)
            return { error: 'NO_SESSION' }
        }

        const validHelseIdToken = await validateHelseIdAccessToken()
        if (!validHelseIdToken) {
            failSpan.silently(span, 'Invalid HelseID token')
            return { error: 'NO_HELSEID' }
        }

        const [behandler, pasient] = await Promise.all([getBehandler(readyClient), getPasient(readyClient)])

        if (isResourceError(behandler)) {
            failSpan.silently(span, behandler.error)

            if (behandler.error === 'NO_HPR') return { error: 'NO_HPR' }
            return { error: 'NO_SESSION' }
        }

        if (isResourceError(pasient)) {
            failSpan.silently(span, pasient.error)
            return { error: 'NO_PATIENT' }
        }

        const helseIdBehandler = await getHelseIdBehandler()
        if (behandler.hpr === helseIdBehandler?.hpr) {
            logger.info(`HPR matches between FHIR practitioner and HelseID`)
        } else {
            logger.error(
                `HPR mismatch between FHIR practitioner (${behandler.hpr}) and HelseID (${helseIdBehandler?.hpr})`,
            )
        }

        metrics.appLoadsTotal.inc({ hpr: behandler.hpr, mode: 'FHIR' })

        const toggles = await spanServerAsync(
            'FHIR.getRootFhirData.toggles',
            async () => await getUserToggles(behandler.hpr),
        )
        if (!getFlag('PILOT_USER', toggles)) {
            logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr}`)

            redirect('/fhir/error/non-pilot-user')
        }

        const requireBruksvilkarToggle = getFlag('SYK_INN_REQUIRE_BRUKSVILKAR', toggles)
        const acceptedBruksvilkar = await hasAcceptedBruksvilkar(behandler.hpr)
        span.setAttribute('PilotUser.bruskvilkar.acceptedAt', acceptedBruksvilkar?.acceptedAt ?? 'never')
        span.setAttribute('PilotUser.bruksvilkar.stale', acceptedBruksvilkar?.stale ? 'yes' : 'no')
        span.setAttribute('PilotUser.bruksvilkar.toggledOn', requireBruksvilkarToggle ? 'yes' : 'no')

        if (requireBruksvilkarToggle && (acceptedBruksvilkar?.acceptedAt == null || acceptedBruksvilkar.stale)) {
            logger.info(
                `User needs to sign (is stale: ${acceptedBruksvilkar?.stale ? 'yes' : 'no'}) the bruksvilkår, HPR: ${behandler.hpr})`,
            )

            redirect(`/fhir/bruksvilkar?returnTo=${currentPatientId}`)
        }

        return {
            pasient: { type: 'auto', navn: pasient.navn, ident: pasient.ident },
            acceptedBruksvilkarAt: acceptedBruksvilkar?.acceptedAt ?? null,
            toggles,
        } satisfies RootFhirData
    })
}

export default LaunchedLayout
