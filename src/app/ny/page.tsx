'use client'

import React, { ReactElement } from 'react'
import Link from 'next/link'

import NySykmeldingForm from '@components/ny-sykmelding/NySykmeldingForm'
import { isLocalOrDemo } from '@utils/env'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { NySykmeldingFormDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

function Page(): ReactElement {
    const StandaloneDataService: NySykmeldingFormDataService = {
        getPatient: () => ({
            navn: 'Standalone Alonessen',
            fnr: '12345678910',
        }),
    }

    return (
        <div className="p-8">
            {isLocalOrDemo && (
                <div className="-mt-4 mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}

            <NySykmeldingFormDataProvider dataService={StandaloneDataService}>
                <NySykmeldingForm />
            </NySykmeldingFormDataProvider>
        </div>
    )
}

export default Page
