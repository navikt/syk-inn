import '../globals.css'

import React, { ReactElement } from 'react'
import type { Metadata } from 'next'

import { bundledEnv } from '@lib/env'

import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default function FhirLayout({ children }: LayoutProps<'/fhir'>): ReactElement {
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
                {children}
                <div className="fixed bottom-2 left-2 text-text-subtle text-sm">
                    Versjon:{' '}
                    {bundledEnv.NEXT_PUBLIC_VERSION !== 'development' ? (
                        <a
                            href={`https://github.com/navikt/syk-inn/commit/${bundledEnv.NEXT_PUBLIC_VERSION}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {bundledEnv.NEXT_PUBLIC_VERSION?.slice(0, 7)}
                        </a>
                    ) : (
                        'development'
                    )}
                </div>
            </body>
        </html>
    )
}
