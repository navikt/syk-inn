import React, { ReactElement } from 'react'

import { DupliserSykmeldingFormWithDefaultValues } from '@features/actions/dupliser-sykmelding/DupliserSykmelding'
import NySykmeldingPagesWithContextPatientHeader from '@features/common/NySykmeldingPagesWithContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/dupliser/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingPagesWithContextPatientHeader lead="Dupliser sykmelding for">
            <DupliserSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPagesWithContextPatientHeader>
    )
}

export default Page
