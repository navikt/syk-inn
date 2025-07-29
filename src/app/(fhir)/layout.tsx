import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import type { Metadata } from 'next'

import { isLocal, isDemo } from '@lib/env'
import DemoWarning from '@components/demo-warning'
import Providers from '@core/providers/Providers'
import { LazyDevTools } from '@dev/tools/LazyDevTools'

import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default function FhirLayout({ children }: PropsWithChildren): ReactElement {
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
                <Providers mode="FHIR">
                    {(isLocal || isDemo) && <DemoWarning />}
                    {children}
                    {(isLocal || isDemo) && <LazyDevTools />}
                </Providers>
            </body>
        </html>
    )
}
