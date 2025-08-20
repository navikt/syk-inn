import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'

import { getUserToggles } from '@core/toggles/unleash'
import { getHelseIdUserInfo } from '@data-layer/helseid/helseid-userinfo'
import { ToggleProvider } from '@core/toggles/context'
import { isDemo, isLocal } from '@lib/env'
import DemoWarning from '@components/user-warnings/DemoWarning'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function DevLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
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
                {(isLocal || isDemo) && <DemoWarning />}
                <ToggleProvider toggles={toggles}>{children}</ToggleProvider>
            </body>
        </html>
    )
}
