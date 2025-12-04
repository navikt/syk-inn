import React, { ReactElement } from 'react'

import { ForlengSykmeldingFormWithDefaultValues } from '@features/actions/forleng-sykmelding/ForlengSykmelding'
import NySykmeldingPagesWithContextPatientHeader from '@features/fhir/common/NySykmeldingPagesWithContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/[patientId]/forleng/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingPagesWithContextPatientHeader lead="Forleng sykmelding for">
            <ForlengSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPagesWithContextPatientHeader>
    )
}

export default Page
