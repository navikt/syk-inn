import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { redirect, unauthorized } from 'next/navigation'
import { cookies } from 'next/headers'

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
        return <NoBehandlerError />
    }

    if (behandler.hpr == null) {
        return <NoValidHPR mode="HelseID" />
    }

    if (!getFlag('PILOT_USER', toggles)) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr}`)
        unauthorized()
    }

    return (
        <>
            <HelseIdHeader behandler={{ navn: behandler.navn, hpr: behandler.hpr }} />
            <ToggleProvider toggles={toToggleMap(toggles)}>
                {children}
                <LoggedOutWarning />
                {(isLocal || isDemo) && <LazyDevTools />}
            </ToggleProvider>
        </>
    )
}

export default StandaloneLoggedInLayout
