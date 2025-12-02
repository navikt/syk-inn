import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { redirect } from 'next/navigation'

import MultiUserQueryStateToSessionStorageOnInit from '@data-layer/fhir/multi-user/MultiUserQueryStateToSessionStorageOnInit'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { NoValidHPR } from '@components/errors/NoValidHPR'
import { getFlag, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { ToggleProvider } from '@core/toggles/context'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { bundledEnv, isDemo, isLocal } from '@lib/env'
import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import metrics from '@lib/prometheus/metrics'
import DemoWarning from '@components/user-warnings/DemoWarning'
import { LazyDevTools } from '@dev/tools/LazyDevTools'
import Providers from '@core/providers/Providers'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getNameFromFhir, getValidPatientIdent } from '@data-layer/fhir/mappers/patient'
import { AutoPatient } from '@core/redux/reducers/ny-sykmelding/patient'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { ModeProvider } from '@core/providers/Modes'

import { NoPractitionerSession, NoValidPatient } from './launched-errors'

/**
 * Any FHIR launched session requires a practitioner with a valid HPR, and a patient with a valid ident.
 *
 * This layout fetches required data and renders any specific error. The happy path will initialize the Providers
 * with the fetched patient and feature toggles. In FHIR mode the patient can never be changed without launching
 * again, so the redux state will never be updated.
 */
async function LaunchedLayout({ children }: LayoutProps<'/fhir'>): Promise<ReactElement> {
    const rootFhirData = await getRootFhirData()

    if ('error' in rootFhirData) {
        if (bundledEnv.runtimeEnv === 'prod-gcp') {
            logger.error(`Faking non-pilot page for error ${rootFhirData.error} in production! 🙈`)
            return <NonPilotUserWarning />
        }

        metrics.appLoadErrorsTotal.inc({ mode: 'FHIR', error_type: rootFhirData.error })

        switch (rootFhirData.error) {
            case 'NO_HPR':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NoValidHPR mode="FHIR" />
                    </>
                )
            case 'NO_SESSION':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NoPractitionerSession />
                    </>
                )
            case 'NO_PATIENT':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NoValidPatient />
                    </>
                )
        }
    }

    return (
        <ModeProvider mode="FHIR">
            <Providers patient={rootFhirData.pasient}>
                <ToggleProvider toggles={toToggleMap(rootFhirData.toggles)}>
                    {(isLocal || isDemo) && <DemoWarning />}
                    <MultiUserQueryStateToSessionStorageOnInit />
                    {children}
                    <LoggedOutWarning />
                    {(isLocal || isDemo) && <LazyDevTools />}
                </ToggleProvider>
            </Providers>
        </ModeProvider>
    )
}

type RootFhirData =
    | {
          error: 'NO_HPR' | 'NO_SESSION' | 'NO_PATIENT'
      }
    | {
          pasient: AutoPatient
          toggles: Awaited<ReturnType<typeof getUserToggles>>
      }

async function getRootFhirData(): Promise<RootFhirData> {
    return await spanServerAsync('FHIR.getRootFhirData', async (span) => {
        const readyClient = await getReadyClient()
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

        metrics.appLoadsTotal.inc({ hpr: hpr, mode: 'FHIR' })

        if (!getFlag('PILOT_USER', toggles)) {
            logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)

            redirect('/fhir/error/non-pilot-user')
        }

        const navn = getNameFromFhir(patient.name)
        const ident = getValidPatientIdent(patient.identifier)

        if (ident == null) {
            failSpan(span, 'Patient without valid FNR/DNR')
            return { error: 'NO_PATIENT' }
        }

        return { pasient: { type: 'auto', navn, ident }, toggles } satisfies RootFhirData
    })
}

export default LaunchedLayout
