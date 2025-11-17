import React, { ReactElement } from 'react'

import { DraftSykmeldingFormWithDefaultValues } from '@features/actions/ny-sykmelding-from-draft/NySykmeldingFromDraft'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { StaticPageHeading } from '@components/layout/Page'

async function Page({ params }: PageProps<'/draft/[draftId]'>): Promise<ReactElement> {
    const draftId = (await params).draftId

    return (
        <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding (utkast)</StaticPageHeading>}>
            <DraftSykmeldingFormWithDefaultValues draftId={draftId} />
        </NySykmeldingPageSteps>
    )
}

export default Page
