'use client'

import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import Link from 'next/link'
import { oauth2 } from 'fhirclient'
import { useQuery } from '@tanstack/react-query'

import Test from '@fhir/components/Test'
import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding/NySykmeldingForm'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'

import { createFhirFetcher } from './fhir-context'

function Page(): ReactElement {
    const client = useQuery({
        queryKey: ['fhir-client'],
        queryFn: async () => {
            return oauth2.ready()
        },
    })

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
            {client.isLoading && <p>Setting up FHIR-context...</p>}
            {client.isError && <p>Error: {client.error.message}</p>}
            {client.data && (
                <NySykmeldingFormDataProvider dataService={createFhirFetcher(client.data)}>
                    <NySykmeldingForm />
                </NySykmeldingFormDataProvider>
            )}
            <Test />
        </div>
    )
}

export default Page
