import { redirect } from 'next/navigation'
import React, { ReactElement } from 'react'

import { createFhirPaths } from '#core/providers/ModePaths'
import { NySykmeldingFormWithDefaultValues } from '#features/actions/ny-sykmelding/NySykmelding'

async function NySykmeldingPage({ params, searchParams }: PageProps<'/fhir/[patientId]/ny'>): Promise<ReactElement> {
    const search = await searchParams
    const draftId = search['draft']

    if (draftId && typeof draftId === 'string') {
        /**
         * If this page is (re-)-loaded and this server-component runs, it means that it has already started
         * and saved a draft. For simplicity's sake we'll just redirect to the draft form and let it handle
         * the re-initialization of the form with draft values.
         *
         * This should never run during normal client side navigation in the browser.
         */
        const patientId = (await params).patientId
        const step = search['step']
        const currentStep = typeof step === 'string' ? step : 'main'

        redirect(`${createFhirPaths(patientId).utkast(draftId)}?step=${currentStep}`)
    }

    return <NySykmeldingFormWithDefaultValues />
}

export default NySykmeldingPage
