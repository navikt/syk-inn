import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import DemoWarning from '@components/user-warnings/DemoWarning'
import { isLocal, isDemo } from '@lib/env'
import { getUserToggles } from '@core/toggles/unleash'
import { getHelseIdUserInfo } from '@data-layer/helseid/helseid-userinfo'
import HelseIdHeader from '@data-layer/helseid/components/HelseIdHeader'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { ToggleProvider } from '@core/toggles/context'
import { LazyDevTools } from '@dev/tools/LazyDevTools'
import Providers from '@core/providers/Providers'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const behandler = await getHelseIdUserInfo()
    const toggles = await getUserToggles(behandler?.hpr_number ?? 'unknown-hpr-number')

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
                <Page footerPosition="belowFold">
                    {(isLocal || isDemo) && <DemoWarning />}
                    <ToggleProvider toggles={toggles}>
                        <Providers mode="HelseID">
                            <LoggedOutWarning />
                            {children}
                            {(isLocal || isDemo) && <LazyDevTools />}
                        </Providers>
                    </ToggleProvider>
                </Page>
            </body>
        </html>
    )
}
