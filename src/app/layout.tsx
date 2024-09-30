import './globals.css'

import type { Metadata } from 'next'
import React, { PropsWithChildren, ReactElement } from 'react'
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr'
import Script from 'next/script'
import { Page } from '@navikt/ds-react'

import Preload from './preload'
import Providers from './providers'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

// TODO: Based on ingress? Path? Build?
const MODE: 'standalone' | 'fhir' = 'standalone'

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
    switch (MODE) {
        case 'standalone':
            return <StandaloneLayout>{children}</StandaloneLayout>
        case 'fhir':
            return <FhirLayout>{children}</FhirLayout>
    }
}

async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const Decorator = await fetchDecoratorReact({
        env: 'prod',
        params: {
            context: 'samarbeidspartner',
        },
    })

    return (
        <html lang="no">
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
                    <Providers>{children}</Providers>
                    <Decorator.Scripts loader={Script} />
                </Page>
            </body>
        </html>
    )
}

function FhirLayout({ children }: PropsWithChildren): ReactElement {
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
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
