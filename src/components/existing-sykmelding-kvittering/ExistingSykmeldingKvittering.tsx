'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useNySykmeldingDataService } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'

type Props = {
    sykmeldingId: string
}

function ExistingSykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    const dataService = useNySykmeldingDataService()
    const { isLoading, data, error } = useQuery({
        queryKey: ['sykmelding', sykmeldingId],
        queryFn: async () => dataService.query.sykmelding(sykmeldingId),
    })

    return (
        <div>
            {isLoading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && <p>Existing sykmelding: {JSON.stringify(data)}</p>}
        </div>
    )
}

export default ExistingSykmeldingKvittering
