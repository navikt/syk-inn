import { logger } from '@navikt/next-logger'
import { redirect } from 'next/navigation'
import React, { ReactElement } from 'react'

import { NoValidHPR } from '#components/errors/NoValidHPR'
import FeedbackButton from '#components/feedback/FeedbackButton'
import LoggedOutWarning from '#components/user-warnings/LoggedOutWarning'
import { createFhirPaths } from '#core/providers/ModePaths'
import { FhirModeProvider } from '#core/providers/Modes'
import Providers from '#core/providers/Providers'
import { AutoPatient } from '#core/redux/reducers/ny-sykmelding/patient'
import { hasAcceptedBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { ToggleProvider } from '#core/toggles/context'
import { getFlag, getUserToggles, toToggleMap } from '#core/toggles/unleash'
import { getNameFromFhir, getValidPatientIdent } from '#data-layer/fhir/mappers/patient'
import { getHpr } from '#data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { getHelseIdBehandler } from '#data-layer/helseid/helseid-service'
import { getHelseIdAccessToken, getHelseIdIdToken } from '#data-layer/helseid/token/tokens'
import { LazyDevTools } from '#dev/tools/LazyDevTools'
import { isDemo, isLocal } from '#lib/env'
import { failSpan, spanServerAsync } from '#lib/otel/server'
import metrics from '#lib/prometheus/metrics'

import { NoPractitionerSession, NoValidPatient } from './launched-errors'

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
                    <FeedbackButton />
                </ToggleProvider>
            </Providers>
        </FhirModeProvider>
    )
}

type RootFhirData =
    | {
          error: 'NO_HPR' | 'NO_SESSION' | 'NO_PATIENT'
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

        const [practitioner, patient] = await Promise.all([readyClient.user.request(), readyClient.patient.request()])

        if ('error' in practitioner) {
            failSpan.silently(span, practitioner.error)
            return { error: 'NO_SESSION' }
        }

        if ('error' in patient) {
            failSpan(span, patient.error)
            return { error: 'NO_PATIENT' }
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            logger.warn(`Practitioner does not have HPR, practitioner: ${JSON.stringify(practitioner)}`)
            return { error: 'NO_HPR' }
        }

        const toggles = await spanServerAsync('FHIR.getRootFhirData.toggles', async () => await getUserToggles(hpr))

        const flag = getFlag('SYK_INN_HELSEID_DOUBLE_AUTH_EXP', toggles)
        if (flag) {
            try {
                const helseIdAccessToken = await getHelseIdAccessToken()
                const helseIdIdToken = await getHelseIdIdToken()
                logger.info(
                    `[HelseID-double-auth-exp] HelseID tokens on FHIR path! access_token length: ${helseIdAccessToken.length}, id_token length: ${helseIdIdToken.length}`,
                )

                // Match HPR-number in HelseID token with FHIR-resource HPR-number
                const helseIdUserInfo = await getHelseIdBehandler()
                const helseIdHpr = helseIdUserInfo?.hpr

                if (helseIdHpr && helseIdHpr === hpr) {
                    logger.info(`[HelseID-double-auth-exp] HelseID HPR matches FHIR HPR`)
                }
            } catch (e) {
                logger.warn(
                    `[HelseID-double-auth-exp] Error while getting HelseID auth information: ${(e as Error).message}`,
                )
            }
        }

        metrics.appLoadsTotal.inc({ hpr: hpr, mode: 'FHIR' })
        if (!getFlag('PILOT_USER', toggles)) {
            logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)

            redirect('/fhir/error/non-pilot-user')
        }

        const requireBruksvilkarToggle = getFlag('SYK_INN_REQUIRE_BRUKSVILKAR', toggles)
        const acceptedBruksvilkar = await hasAcceptedBruksvilkar(hpr)
        span.setAttribute('PilotUser.bruskvilkar.acceptedAt', acceptedBruksvilkar?.acceptedAt ?? 'never')
        span.setAttribute('PilotUser.bruksvilkar.stale', acceptedBruksvilkar?.stale ? 'yes' : 'no')
        span.setAttribute('PilotUser.bruksvilkar.toggledOn', requireBruksvilkarToggle ? 'yes' : 'no')

        if (requireBruksvilkarToggle && (acceptedBruksvilkar?.acceptedAt == null || acceptedBruksvilkar.stale)) {
            logger.info(
                `User needs to sign (is stale: ${acceptedBruksvilkar?.stale ? 'yes' : 'no'}) the bruksvilkår, HPR: ${hpr})`,
            )

            redirect(`/fhir/bruksvilkar?returnTo=${currentPatientId}`)
        }

        const navn = getNameFromFhir(patient.name)
        const ident = getValidPatientIdent(patient.identifier)

        if (ident == null) {
            failSpan(span, 'Patient without valid FNR/DNR')
            return { error: 'NO_PATIENT' }
        }

        return {
            pasient: { type: 'auto', navn, ident },
            acceptedBruksvilkarAt: acceptedBruksvilkar?.acceptedAt ?? null,
            toggles,
        } satisfies RootFhirData
    })
}

export default LaunchedLayout
