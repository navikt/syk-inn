import '../globals.css'
import type { Metadata } from 'next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React, { ReactElement } from 'react'

import { DemoHeader } from '#components/user-warnings/DemoHeader'
import { isDemo, isLocal } from '#lib/env'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Scenarioer | syk-inn',
}

export default async function DevLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
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
                <NuqsAdapter>
                    {(isLocal || isDemo) && <DemoHeader />}
                    {children}
                </NuqsAdapter>
            </body>
        </html>
    )
}
