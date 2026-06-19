import React, { ReactElement } from 'react'

import { DupliserSykmeldingFormWithDefaultValues } from '#features/actions/dupliser-sykmelding/DupliserSykmelding'

async function Page({ params }: PageProps<'/fhir/[patientId]/dupliser/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return <DupliserSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
}

export default Page
