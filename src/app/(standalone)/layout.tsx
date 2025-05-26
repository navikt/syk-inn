import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'
import { getToggles } from '@toggles/unleash'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../../providers/Providers'
import Preload from '../preload'
import HelseIdDataProvider from '../../helseid/components/HelseIdDataProvider'
import { getHelseIdUserInfo } from '../../helseid/helseid-userinfo'
import HelseIdHeader from '../../helseid/components/HelseIdHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const [behandler, toggles] = await Promise.all([getHelseIdUserInfo(), getToggles()])

    return (
        <html lang="nb">
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
                    {isLocalOrDemo && <DemoWarning />}
                    <Providers toggles={toggles}>
                        <HelseIdDataProvider
                            behandler={{
                                navn: 'TODO',
                                hpr: behandler?.hpr_number ?? 'TODO',
                            }}
                        >
                            {children}
                            {isLocalOrDemo && <LazyDevTools />}
                        </HelseIdDataProvider>
                    </Providers>
                </Page>
            </body>
        </html>
    )
}
