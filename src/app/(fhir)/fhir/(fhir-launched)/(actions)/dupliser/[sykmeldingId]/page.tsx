import React, { ReactElement } from 'react'

import { DupliserSykmeldingFormWithDefaultValues } from '@features/actions/dupliser-sykmelding/DupliserSykmelding'
import NySykmeldingContextPatientHeader from '@features/common/NySykmeldingContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/dupliser/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingContextPatientHeader lead="Dupliser sykmelding for">
            <DupliserSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingContextPatientHeader>
    )
}

export default Page
