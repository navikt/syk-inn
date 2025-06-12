import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../../providers/Providers'
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
                    {isLocalOrDemo && <DemoWarning />}
                    <LoggedOutWarning />
                    {children}
                    {isLocalOrDemo && <LazyDevTools />}
                </Providers>
            </body>
        </html>
    )
}
