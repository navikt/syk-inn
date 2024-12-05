import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../providers'
import Preload from '../preload'
import HelseIdDataServiceProvider from '../../helseid/components/HelseIdDataServiceProvider'
import { getHelseIdUserInfo } from '../../helseid/helseid-userinfo'
import HelseIdHeader from '../../helseid/components/HelseIdHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const behandler = await getHelseIdUserInfo()

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
                    <Providers>
                        <HelseIdDataServiceProvider
                            behandler={{
                                navn: 'TODO',
                                hpr: behandler?.hpr_number ?? 'TODO',
                                autorisasjoner: [],
                            }}
                        >
                            {children}
                            {isLocalOrDemo && <LazyDevTools />}
                        </HelseIdDataServiceProvider>
                    </Providers>
                </Page>
            </body>
        </html>
    )
}
