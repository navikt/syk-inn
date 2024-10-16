import './globals.css'

import type { Metadata } from 'next'
import React, { PropsWithChildren, ReactElement } from 'react'
import { fetchDecoratorReact } from '@navikt/nav-dekoratoren-moduler/ssr'
import Script from 'next/script'
import { Page } from '@navikt/ds-react'
import { cookies } from 'next/headers'
import { logger } from '@navikt/next-logger'
import dynamic from 'next/dynamic'

import { isLocalOrDemo } from '@utils/env'
import FhirHeader from '@fhir/components/FhirHeader'

import Preload from './preload'
import Providers from './providers'
import DemoWarning from './demo-warning'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

const DevTools = dynamic(() => import('../devtools/DevTools'), { ssr: false })

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
    // TODO: Mode is only toggleable by devtools, in production this should be inferred by something else (ingress?)
    // Option 1:
    // IF →   https://sykmelding-fhir.nav.no?iss=https://anita-systems.no/fhir/v4 → FHIR-MODE
    // ELSE → https://nav.no/samarbeidspartner/sykmelding → DECORATOR MODE

    // Option 2:
    // IF →   https://nav.no/samarbeidspartner/sykmelding/fhir?iss=https://anita-systems.no/fhir/v4 → FHIR-MODE
    // ELSE → https://nav.no/samarbeidspartner/sykmelding → DECORATOR MODE
    const modeOverride = isLocalOrDemo ? (cookies().get('development-mode-override')?.value ?? null) : null
    const MODE = modeOverride === 'standalone' || modeOverride === 'fhir' ? modeOverride : 'standalone'

    logger.info(`Layout: Rendering mode ${MODE} (override: ${modeOverride})`)

    switch (MODE) {
        case 'standalone':
            return <StandaloneLayout>{children}</StandaloneLayout>
        case 'fhir':
            return <FhirLayout>{children}</FhirLayout>
    }
}

async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const Decorator = await fetchDecoratorReact({
        env: 'dev',
        params: {
            context: 'samarbeidspartner',
            simple: true,
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
                    {isLocalOrDemo && <DemoWarning />}
                    <Providers>
                        {children}
                        {isLocalOrDemo && <DevTools mode="standalone" />}
                    </Providers>
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
                <Page footerPosition="belowFold">
                    <Providers>
                        <FhirHeader />
                        {isLocalOrDemo && <DemoWarning />}
                        {children}
                        {isLocalOrDemo && <DevTools mode="fhir" />}
                    </Providers>
                </Page>
            </body>
        </html>
    )
}
