import '../globals.css'
import type { Metadata } from 'next'
import React, { ReactElement } from 'react'

import BuildInfo from '@components/misc/BuildInfo'
import DemoFrame from '@dev/demo-epj-frame/DemoFrame'

import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default function FhirLayout({ children }: LayoutProps<'/'>): ReactElement {
    return (
        <html lang="nb" className="bg-ax-bg-neutral-soft">
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
                <DemoFrame>
                    {children}
                    <BuildInfo />
                </DemoFrame>
            </body>
        </html>
    )
}
