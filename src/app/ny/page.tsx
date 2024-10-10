'use client'

import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Heading } from '@navikt/ds-react'

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
        <div className="p-8">
            {isLocalOrDemo && (
                <div className="-mt-4 mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}

            <Heading level="2" size="medium" spacing>
                You stand alone in this
            </Heading>

            <NySykmeldingFormDataProvider dataService={StandaloneDataService}>
                <NySykmeldingForm />
            </NySykmeldingFormDataProvider>
        </div>
    )
}

export default Page
