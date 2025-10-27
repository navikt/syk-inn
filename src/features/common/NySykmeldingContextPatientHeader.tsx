'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument } from '@queries'
import { LoadablePageHeader } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'

type Props = {
    lead: string
}

/**
 * Header that fetches the contextuality available patient from the GQL schema
 * and displays a header with loading state.
 */
function NySykmeldingContextPatientHeader({ children, lead }: PropsWithChildren<Props>): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead={lead} value={pasientQuery.data?.pasient?.navn ?? null} />}
        >
            {children}
        </NySykmeldingPageSteps>
    )
}

export default NySykmeldingContextPatientHeader
