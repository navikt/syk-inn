import React, { ReactElement } from 'react'

import { DraftSykmeldingFormWithDefaultValues } from '@features/actions/ny-sykmelding-from-draft/NySykmeldingFromDraft'
import NySykmeldingContextPatientHeader from '@features/common/NySykmeldingContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/draft/[draftId]'>): Promise<ReactElement> {
    const draftId = (await params).draftId

    return (
        <NySykmeldingContextPatientHeader lead="Ny sykmelding for">
            <DraftSykmeldingFormWithDefaultValues draftId={draftId} />
        </NySykmeldingContextPatientHeader>
    )
}

export default Page
