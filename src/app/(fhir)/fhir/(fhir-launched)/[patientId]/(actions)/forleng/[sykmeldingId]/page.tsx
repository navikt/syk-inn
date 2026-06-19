import React, { ReactElement } from 'react'

import { ForlengSykmeldingFormWithDefaultValues } from '#features/actions/forleng-sykmelding/ForlengSykmelding'

async function Page({ params }: PageProps<'/fhir/[patientId]/forleng/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return <ForlengSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
}

export default Page
