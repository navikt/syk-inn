import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'
import FhirHeader from '@fhir/components/FhirHeader'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../providers'
import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default function FhirLayout({ children }: PropsWithChildren): ReactElement {
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
                    <Providers>
                        <FhirHeader />
                        {isLocalOrDemo && <DemoWarning />}
                        {children}
                        {isLocalOrDemo && <LazyDevTools mode="fhir" />}
                    </Providers>
                </Page>
            </body>
        </html>
    )
}
