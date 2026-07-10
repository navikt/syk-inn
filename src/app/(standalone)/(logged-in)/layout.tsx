import { logger } from '@navikt/next-logger'
import { redirect } from 'next/navigation'
import React, { ReactElement } from 'react'

import { NoValidHPR } from '#components/errors/NoValidHPR'
import { DemoWarning } from '#components/user-warnings/DemoWarning'
import { LoggedOutWarning } from '#components/user-warnings/LoggedOutWarning'
import { NonPilotUserWarning } from '#components/user-warnings/NonPilotUserWarning'
import { HelseIdPaths } from '#core/providers/ModePaths'
import { HelseIdModeProvider } from '#core/providers/Modes'
import { Providers } from '#core/providers/Providers'
import { hasAcceptedBruksvilkar } from '#core/services/bruksvilkar/bruksvilkar-service'
import { ToggleProvider } from '#core/toggles/context'
import { getFlag, getUserlessToggles, getUserToggles, toToggleMap, UnleashClient } from '#core/toggles/unleash'
import { HelseIdHeader } from '#data-layer/helseid/components/HelseIdHeader'
import { getHelseIdBehandler } from '#data-layer/helseid/helseid-service'
import { HydratePersistedUserFromSession } from '#data-layer/helseid/persistent-user/HydratePersistedUserFromSession'
import { LazyDevTools } from '#dev/tools/LazyDevTools'
import { isDemo, isLocal } from '#lib/env'
import { spanServerAsync } from '#lib/otel/server'
import metrics from '#lib/prometheus/metrics'

import { NoBehandlerError } from './start-errors'

async function StandaloneLoggedInLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
    const rootData = await getRootStandaloneData()

    if ('error' in rootData) {
        switch (rootData.error) {
            case 'NO_HPR':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NoValidHPR />
                    </>
                )
            case 'NO_SESSION':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NoBehandlerError />
                    </>
                )
            case 'NON_PILOT_USER':
                return (
                    <>
                        {(isLocal || isDemo) && <DemoWarning />}
                        <NonPilotUserWarning />
                    </>
                )
        }
    }

    return (
        <HelseIdModeProvider>
            <Providers graphqlPath={HelseIdPaths.graphql}>
                <HydratePersistedUserFromSession />
                <HelseIdHeader behandler={rootData.behandler} />
                {(isLocal || isDemo) && <DemoWarning />}
                <ToggleProvider toggles={toToggleMap(rootData.toggles)}>
                    {children}
                    <LoggedOutWarning />
                    {(isLocal || isDemo) && <LazyDevTools />}
                </ToggleProvider>
            </Providers>
        </HelseIdModeProvider>
    )
}

type RootStandaloneData =
    | {
          error: 'NO_HPR' | 'NO_SESSION' | 'NON_PILOT_USER'
      }
    | {
          behandler: { navn: string; hpr: string }
          toggles: UnleashClient
      }

async function getRootStandaloneData(): Promise<RootStandaloneData> {
    return spanServerAsync('HelseID.getRootStandaloneData', async (span) => {
        const [toggles, behandler] = await spanServerAsync('OpenLayout toggles', async () => {
            const userInfo = await getHelseIdBehandler()
            if (userInfo?.hpr == null) {
                return [await getUserlessToggles(), userInfo]
            }
            return [await getUserToggles(userInfo.hpr), userInfo]
        })

        if (behandler == null) {
            metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NO_BEHANDLER' })

            return { error: 'NO_SESSION' }
        }

        if (behandler.hpr == null) {
            metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NO_HPR' })

            return { error: 'NO_HPR' }
        }

        metrics.appLoadsTotal.inc({ hpr: behandler.hpr, mode: 'HelseID' })

        if (!getFlag('PILOT_USER', toggles)) {
            metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NON_PILOT_USER' })

            logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr}`)
            return { error: 'NON_PILOT_USER' }
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

            redirect(`/bruksvilkar`)
        }

        return {
            behandler: {
                hpr: behandler.hpr,
                navn: behandler.navn,
            },
            toggles,
        } satisfies RootStandaloneData
    })
}

export default StandaloneLoggedInLayout
