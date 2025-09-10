import React, { ReactElement } from 'react'

import ForlengSykmelding from '@features/actions/forleng-sykmelding/ForlengSykmelding'

async function Page({ params }: PageProps<'/fhir/forleng/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return <ForlengSykmelding sykmeldingId={sykmeldingId} />
}

export default Page
