import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import metrics from '@lib/prometheus/metrics'
import { MOCK_HELSEID_TOKEN_NAME } from '@navikt/helseid-mock-server'
import HelseIdHeader from '@data-layer/helseid/components/HelseIdHeader'
import { ToggleProvider } from '@core/toggles/context'
import { getFlag, getUserlessToggles, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { isDemo, isLocal } from '@lib/env'
import { NoValidHPR } from '@components/errors/NoValidHPR'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { LazyDevTools } from '@dev/tools/LazyDevTools'
import { spanServerAsync } from '@lib/otel/server'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'
import { shouldUseMockEngine } from '@dev/mock-engine'
import DemoWarning from '@components/user-warnings/DemoWarning'
import Providers from '@core/providers/Providers'
import HydratePersistedUserFromSession from '@data-layer/helseid/persistent-user/HydratePersistedUserFromSession'
import { HelseIdModeProvider } from '@core/providers/Modes'
import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { HelseIdPaths } from '@core/providers/ModePaths'

import { NoBehandlerError } from './start-errors'

async function StandaloneLoggedInLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
    if (shouldUseMockEngine()) {
        if ((await cookies()).get(MOCK_HELSEID_TOKEN_NAME)?.value == null) {
            redirect('/dev')
        }
    }

    const [toggles, behandler] = await spanServerAsync('OpenLayout toggles', async () => {
        const userInfo = await getHelseIdBehandler()
        if (userInfo?.hpr == null) {
            return [await getUserlessToggles(), userInfo]
        }
        return [await getUserToggles(userInfo.hpr), userInfo]
    })

    if (behandler == null) {
        metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NO_BEHANDLER' })

        return (
            <>
                {(isLocal || isDemo) && <DemoWarning />}
                <NoBehandlerError />
            </>
        )
    }

    if (behandler.hpr == null) {
        metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NO_HPR' })

        return (
            <>
                {(isLocal || isDemo) && <DemoWarning />}
                <NoValidHPR mode="HelseID" />
            </>
        )
    }

    metrics.appLoadsTotal.inc({ hpr: behandler.hpr, mode: 'HelseID' })

    if (!getFlag('PILOT_USER', toggles)) {
        metrics.appLoadErrorsTotal.inc({ mode: 'HelseID', error_type: 'NON_PILOT_USER' })

        logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr}`)
        return <NonPilotUserWarning />
    }

    return (
        <HelseIdModeProvider>
            <Providers graphqlPath={HelseIdPaths.graphql}>
                <HydratePersistedUserFromSession />
                <HelseIdHeader behandler={{ navn: behandler.navn, hpr: behandler.hpr }} />
                {(isLocal || isDemo) && <DemoWarning />}
                <ToggleProvider toggles={toToggleMap(toggles)}>
                    {children}
                    <LoggedOutWarning />
                    {(isLocal || isDemo) && <LazyDevTools />}
                </ToggleProvider>
            </Providers>
        </HelseIdModeProvider>
    )
}

export default StandaloneLoggedInLayout
