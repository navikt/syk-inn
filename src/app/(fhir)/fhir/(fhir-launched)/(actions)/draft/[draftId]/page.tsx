import React, { ReactElement } from 'react'

import { DraftSykmeldingFormWithDefaultValues } from '@features/actions/ny-sykmelding-from-draft/NySykmeldingFromDraft'
import NySykmeldingPagesWithContextPatientHeader from '@features/common/NySykmeldingPagesWithContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/draft/[draftId]'>): Promise<ReactElement> {
    const draftId = (await params).draftId

    return (
        <NySykmeldingPagesWithContextPatientHeader lead="Ny sykmelding for">
            <DraftSykmeldingFormWithDefaultValues draftId={draftId} />
        </NySykmeldingPagesWithContextPatientHeader>
    )
}

export default Page
