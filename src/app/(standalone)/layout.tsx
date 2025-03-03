import '../globals.css'

import React, { PropsWithChildren, ReactElement } from 'react'
import { Page } from '@navikt/ds-react'
import type { Metadata } from 'next'

import { isLocalOrDemo } from '@utils/env'
import DemoWarning from '@components/demo-warning'

import { Autorisasjoner } from '../../data-fetcher/data-service'
import { LazyDevTools } from '../../devtools/LazyDevTools'
import Providers from '../../providers/Providers'
import Preload from '../preload'
import HelseIdDataProvider from '../../helseid/components/HelseIdDataProvider'
import { getHelseIdUserInfo, HprDetails } from '../../helseid/helseid-userinfo'
import HelseIdHeader from '../../helseid/components/HelseIdHeader'
import { getToggles } from '../../toggles/unleash'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: '(Ny) Innsending av Sykmeldinger',
}

export default async function StandaloneLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const [behandler, toggles] = await Promise.all([getHelseIdUserInfo(), getToggles()])

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
                <HelseIdHeader
                    behandler={{
                        navn: 'TODO',
                        hpr: behandler?.hpr_number ?? 'TODO',
                    }}
                />
                <Page footerPosition="belowFold">
                    {isLocalOrDemo && <DemoWarning />}
                    <Providers toggles={toggles}>
                        <HelseIdDataProvider
                            behandler={{
                                navn: 'TODO',
                                hpr: behandler?.hpr_number ?? 'TODO',
                                autorisasjoner: getAutorisasjonerFromHelseIdUserInfo(behandler?.approvals),
                            }}
                        >
                            {children}
                            {isLocalOrDemo && <LazyDevTools />}
                        </HelseIdDataProvider>
                    </Providers>
                </Page>
            </body>
        </html>
    )
}

function getAutorisasjonerFromHelseIdUserInfo(approvals: HprDetails['approvals'] | undefined): Autorisasjoner {
    if (!approvals) {
        return []
    }

    return approvals.map((approval) => ({
        kategori: {
            system: 'urn:oid:2.16.578.1.12.4.1.1.9060',
            code: approval.profession,
            display: 'TODO',
        },
        autorisasjon: {
            system: 'urn:oid:2.16.578.1.12.4.1.1.7704',
            code: approval.authorization.value,
            display: approval.authorization.description,
        },
        // TODO
        spesialisering: null,
    }))
}
