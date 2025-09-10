import React, { ReactElement } from 'react'

import DupliserSykmelding from '@features/actions/dupliser-sykmelding/DupliserSykmelding'

async function Page({ params }: PageProps<'/fhir/dupliser/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return <DupliserSykmelding sykmeldingId={sykmeldingId} />
}

export default Page
