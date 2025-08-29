import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { unauthorized } from 'next/navigation'

import HelseIdHeader from '@data-layer/helseid/components/HelseIdHeader'
import { ToggleProvider } from '@core/toggles/context'
import { getFlag, getUserlessToggles, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { isDemo, isLocal } from '@lib/env'
import DemoWarning from '@components/user-warnings/DemoWarning'
import { NoValidHPR } from '@components/errors/NoValidHPR'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { LazyDevTools } from '@dev/tools/LazyDevTools'
import { spanServerAsync } from '@lib/otel/server'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'

async function StandaloneLoggedInLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
    const [toggles, behandler] = await spanServerAsync('OpenLayout toggles', async () => {
        const userInfo = await getHelseIdBehandler()
        if (userInfo.hpr == null) {
            return [await getUserlessToggles(), userInfo]
        }
        return [await getUserToggles(userInfo.hpr), userInfo]
    })

    if (!getFlag('PILOT_USER', toggles)) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr}`)
        unauthorized()
    }

    return (
        <>
            <HelseIdHeader behandler={{ navn: behandler.navn, hpr: behandler.hpr }} />
            <ToggleProvider toggles={toToggleMap(toggles)}>
                {(isLocal || isDemo) && <DemoWarning />}
                {behandler.hpr == null ? <NoValidHPR mode="HelseID" /> : children}
                <LoggedOutWarning />
                {(isLocal || isDemo) && <LazyDevTools />}
            </ToggleProvider>
        </>
    )
}

export default StandaloneLoggedInLayout
