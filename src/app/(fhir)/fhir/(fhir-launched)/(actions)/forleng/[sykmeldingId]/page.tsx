import React, { ReactElement } from 'react'

import { ForlengSykmeldingFormWithDefaultValues } from '@features/actions/forleng-sykmelding/ForlengSykmelding'
import NySykmeldingContextPatientHeader from '@features/common/NySykmeldingContextPatientHeader'

async function Page({ params }: PageProps<'/fhir/forleng/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingContextPatientHeader lead="Forleng sykmelding for">
            <ForlengSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingContextPatientHeader>
    )
}

export default Page
