import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'

import DemoWarning from '@components/user-warnings/DemoWarning'
import { isLocal, isDemo } from '@lib/env'
import Providers from '@core/providers/Providers'
import { LazyDevTools } from '@dev/tools/LazyDevTools'

import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default function FhirLayout({ children }: LayoutProps<'/'>): ReactElement {
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
