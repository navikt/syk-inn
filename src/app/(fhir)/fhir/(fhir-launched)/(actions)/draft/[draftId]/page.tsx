import React, { ReactElement } from 'react'

import NySykmeldingFromDraft from '@features/actions/ny-sykmelding-from-draft/NySykmeldingFromDraft'

async function Page({ params }: PageProps<'/fhir/draft/[draftId]'>): Promise<ReactElement> {
    const draftId = (await params).draftId

    return <NySykmeldingFromDraft draftId={draftId} />
}

export default Page
