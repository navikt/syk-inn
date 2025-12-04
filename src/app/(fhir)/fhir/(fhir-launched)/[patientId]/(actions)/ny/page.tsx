import React, { ReactElement } from 'react'
import { redirect } from 'next/navigation'

import { NySykmeldingFormWithDefaultValues } from '@features/actions/ny-sykmelding/NySykmelding'
import NySykmeldingPagesWithContextPatientHeader from '@features/fhir/common/NySykmeldingPagesWithContextPatientHeader'
import { createFhirPaths } from '@core/providers/ModePaths'

async function NySykmeldingPage({ params, searchParams }: PageProps<'/fhir/[patientId]/ny'>): Promise<ReactElement> {
    const search = await searchParams
    if (search['draft']) {
        /**
         * If this page is (re-)-loaded and this server-component runs, it means that it has already started
         * and saved a draft. For simplicity's sake we'll just redirect to the draft form and let it handle
         * the re-initialization of the form with draft values.
         *
         * This should never run during normal client side navigation in the browser.
         */
        const patientId = (await params).patientId
        const draftId = search['draft'] as string
        const currentStep = search['step'] ?? 'main'

        redirect(`${createFhirPaths(patientId).utkast(draftId)}?step=${currentStep}`)
    }

    return (
        <NySykmeldingPagesWithContextPatientHeader lead="Sykmelding for">
            <NySykmeldingFormWithDefaultValues />
        </NySykmeldingPagesWithContextPatientHeader>
    )
}

export default NySykmeldingPage
