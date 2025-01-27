'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'

import { useDataService } from '../../data-fetcher/data-provider'

type Props = {
    sykmeldingId: string
}

function ExistingSykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    const dataService = useDataService()
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
