import React, { ReactElement } from 'react'
import { redirect } from 'next/navigation'

import { NySykmeldingFormWithDefaultValues } from '@features/actions/ny-sykmelding/NySykmelding'
import NySykmeldingPagesWithContextPatientHeader from '@features/common/NySykmeldingPagesWithContextPatientHeader'

async function NySykmeldingPage({ searchParams }: PageProps<'/fhir/ny'>): Promise<ReactElement> {
    const search = await searchParams
    if (search['draft']) {
        /**
         * If this page is (re-)-loaded and this server-component runs, it means that it has already started
         * and saved a draft. For simplicity's sake we'll just redirect to the draft form and let it handle
         * the re-initialization of the form with draft values.
         *
         * This should never run during normal client side navigation in the browser.
         */
        redirect(`/fhir/draft/${search['draft']}?step=${search['step'] ?? 'main'}`)
    }

    return (
        <NySykmeldingPagesWithContextPatientHeader lead="Sykmelding for">
            <NySykmeldingFormWithDefaultValues />
        </NySykmeldingPagesWithContextPatientHeader>
    )
}

export default NySykmeldingPage
