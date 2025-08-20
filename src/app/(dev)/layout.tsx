import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'

import { isDemo, isLocal } from '@lib/env'
import DemoWarning from '@components/user-warnings/DemoWarning'

import Preload from '../preload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Scenarioer | syk-inn',
}

export default async function DevLayout({ children }: LayoutProps<'/'>): Promise<ReactElement> {
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
                {(isLocal || isDemo) && <DemoWarning />}
                {children}
            </body>
        </html>
    )
}
