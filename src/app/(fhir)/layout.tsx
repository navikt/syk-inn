import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import type { Metadata } from 'next'
import { logger } from '@navikt/next-logger'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'
import { getFlag, getToggles } from '@toggles/unleash'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { getHprFromPractitioner } from '@fhir/fhir-service'
import { spanAsync } from '@otel/otel'

import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../../providers/Providers'
import Preload from '../preload'

export const metadata: Metadata = {
    title: '(FHIR) Innsending av Sykmeldinger',
}

export default async function FhirLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const [toggles, hpr] = await spanAsync('FhirLayout toggles', async () => {
        const hpr = await getHprFromPractitioner()
        return [await getToggles(hpr), hpr]
    })

    if (!getFlag('PILOT_USER', toggles).enabled) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)
    }

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
                <Providers toggles={toggles} mode="FHIR">
                    {isLocalOrDemo && <DemoWarning />}
                    <LoggedOutWarning />
                    {children}
                    {isLocalOrDemo && <LazyDevTools />}
                </Providers>
            </body>
        </html>
    )
}
