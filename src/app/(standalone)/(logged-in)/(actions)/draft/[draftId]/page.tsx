import React, { ReactElement } from 'react'

import { DraftSykmeldingFormWithDefaultValues } from '#features/actions/ny-sykmelding-from-draft/NySykmeldingFromDraft'

async function Page({ params }: PageProps<'/draft/[draftId]'>): Promise<ReactElement> {
    const draftId = (await params).draftId

    return <DraftSykmeldingFormWithDefaultValues draftId={draftId} />
}

export default Page
