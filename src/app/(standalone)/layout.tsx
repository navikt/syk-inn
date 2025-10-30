import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { bundledEnv } from '@lib/env'
import Providers from '@core/providers/Providers'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default function StandaloneLayout({ children }: LayoutProps<'/'>): ReactElement {
    // Standalone and wonderwall is disabled in production
    if (bundledEnv.runtimeEnv === 'prod-gcp') return notFound()

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
                <Providers mode="HelseID">{children}</Providers>
            </body>
        </html>
    )
}
