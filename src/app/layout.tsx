import './globals.css'

import type { Metadata } from 'next'
import React, { PropsWithChildren, ReactElement } from 'react'
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr'
import Script from 'next/script'

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
            <body>
                <Decorator.Header />
                {children}
                <Decorator.Footer />
                <Decorator.Scripts loader={Script} />
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
            <Providers>
                <body>{children}</body>
            </Providers>
        </html>
    )
}
