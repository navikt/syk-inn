'use client'

import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import Link from 'next/link'

import Test from '@fhir/components/Test'
import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding/NySykmeldingForm'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    NotAvailable,
    NySykmeldingFormDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

function Page(): ReactElement {
    const FhirDataService: NySykmeldingFormDataService = {
        context: {
            getPasient: async () => ({
                navn: 'FHIR Fhirresson',
                fnr: '12345678910',
            }),
        },
        query: {
            getPasientByFnr: NotAvailable,
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
                You are FHIR-ed
            </Heading>
            <Test />
            <NySykmeldingFormDataProvider dataService={FhirDataService}>
                <NySykmeldingForm />
            </NySykmeldingFormDataProvider>
        </div>
    )
}

export default Page
