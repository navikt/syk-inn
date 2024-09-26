import type { Metadata } from 'next'
import React, { PropsWithChildren, ReactElement } from 'react'

import Preload from './preload'
import Providers from './providers'

import './globals.css'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
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
