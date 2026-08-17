import '../globals.css'
import type { Metadata } from 'next'
import React, { ReactElement } from 'react'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default function StandaloneLayout({ children }: LayoutProps<'/'>): ReactElement {
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
            <body>{children}</body>
        </html>
    )
}
