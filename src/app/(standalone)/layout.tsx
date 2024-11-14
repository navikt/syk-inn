import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr'
import { Page } from '@navikt/ds-react'
import Script from 'next/script'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../providers'
import Preload from '../preload'
import HelseIdDataServiceProvider from '../../helseid/components/HelseIdDataServiceProvider'
// import { getHelseIdUserInfo } from '../../helseid/helseid-userinfo'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const Decorator = await fetchDecoratorReact({
        env: 'dev',
        params: {
            context: 'samarbeidspartner',
            simple: true,
        },
    })

    // const behandler = await getHelseIdUserInfo()

    return (
        <html lang="nb">
            <head>
                <link rel="icon" href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.ico" sizes="any" />
                <link
                    rel="icon"
                    href="https://cdn.nav.no/personbruker/decorator-next/public/favicon.svg"
                    type="image/svg+xml"
                />
                <Decorator.HeadAssets />
            </head>
            <Preload />
            <body>
                <Page footerPosition="belowFold" footer={<Decorator.Footer />}>
                    <Decorator.Header />
                    {isLocalOrDemo && <DemoWarning />}
                    <Providers>
                        <HelseIdDataServiceProvider
                            behandler={{
                                navn: 'Test',
                                hpr: '123',
                            }}
                        >
                            {children}
                            {isLocalOrDemo && <LazyDevTools />}
                        </HelseIdDataServiceProvider>
                    </Providers>
                    <Decorator.Scripts loader={Script} />
                </Page>
            </body>
        </html>
    )
}
