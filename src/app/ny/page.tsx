'use client'

import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingForm from '@components/ny-sykmelding/NySykmeldingForm'
import { isLocalOrDemo } from '@utils/env'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

function Page(): ReactElement {
    const StandaloneDataService: NySykmeldingFormDataService = {
        context: {
            pasient: NotAvailable,
            arbeidsgivere: NotAvailable,
            bruker: NotAvailable,
        },
        query: {
            pasient: async (fnr) => ({
                oid: {
                    type: 'fødselsnummer',
                    nr: fnr,
                },
                navn: 'Stand Alonessen',
            }),
        },
    }

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}

            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>

            <NySykmeldingFormDataProvider dataService={StandaloneDataService}>
                <NySykmeldingForm />
            </NySykmeldingFormDataProvider>
        </PageBlock>
    )
}

export default Page
