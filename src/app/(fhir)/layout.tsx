import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'
import { getToggles } from '@toggles/unleash'
import FhirHeader from '@fhir/components/FhirHeader'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../../providers/Providers'
import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default async function FhirLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const toggles = await getToggles()

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
            <body>
                <Page footerPosition="belowFold">
                    <Providers toggles={toggles}>
                        <FhirHeader />
                        {isLocalOrDemo && <DemoWarning />}
                        {children}
                        {isLocalOrDemo && <LazyDevTools />}
                    </Providers>
                </Page>
            </body>
        </html>
    )
}
