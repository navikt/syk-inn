import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'
import { logger } from '@navikt/next-logger'
import { unauthorized } from 'next/navigation'

import DemoWarning from '@components/user-warnings/DemoWarning'
import { isLocal, isDemo } from '@lib/env'
import { getFlag, getUserlessToggles, getUserToggles } from '@core/toggles/unleash'
import { getHelseIdUserInfo } from '@data-layer/helseid/helseid-userinfo'
import HelseIdHeader from '@data-layer/helseid/components/HelseIdHeader'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { ToggleProvider } from '@core/toggles/context'
import { LazyDevTools } from '@dev/tools/LazyDevTools'
import Providers from '@core/providers/Providers'
import { spanServerAsync } from '@lib/otel/server'
import { NoValidHPR } from '@components/errors/NoValidHPR'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
    const [toggles, behandler] = await spanServerAsync('OpenLayout toggles', async () => {
        const userInfo = await getHelseIdUserInfo()
        if (typeof userInfo?.hpr_number !== 'string') {
            return [await getUserlessToggles(), userInfo]
        }
        return [await getUserToggles(userInfo.hpr_number), userInfo]
    })

    if (typeof behandler?.hpr_number !== 'string') {
        return <NoValidHPR mode="HelseID" />
    }

    if (!getFlag('PILOT_USER', toggles).enabled) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${behandler.hpr_number}`)
        unauthorized()
    }

    return (
        <html lang="nb" className="bg-bg-subtle">
            <head>
                <link rel="icon" href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.ico" sizes="any" />
                <link
                    rel="icon"
                    href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.svg"
                    type="image/svg+xml"
                />
            </head>
            <Preload />
            <body>
                <HelseIdHeader
                    behandler={{
                        navn: 'TODO',
                        hpr: behandler?.hpr_number ?? 'TODO',
                    }}
                />
                <ToggleProvider toggles={toggles}>
                    <Providers mode="HelseID">
                        {(isLocal || isDemo) && <DemoWarning />}
                        {children}
                        <LoggedOutWarning />
                        {(isLocal || isDemo) && <LazyDevTools />}
                    </Providers>
                </ToggleProvider>
            </body>
        </html>
    )
}
