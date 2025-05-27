import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Heading, Skeleton } from '@navikt/ds-react'

import { useDataService } from '@data-layer/data-fetcher/data-provider'
import { DocumentStatusSuccess } from '@components/existing-sykmelding-kvittering/DocumentStatus'

type Props = {
    sykmeldingId: string
}

export function SykmeldingSynchronization({ sykmeldingId }: Props): ReactElement {
    const dataService = useDataService()
    const { isLoading, data, error, refetch } = useQuery({
        queryKey: ['sykmelding-synchronization', sykmeldingId],
        queryFn: async () => dataService.mutation.synchronize(sykmeldingId),
    })

    if (isLoading) {
        return (
            <div className="max-w-prose">
                <div className="my-4">
                    <Skeleton variant="rectangle" height={62} />
                </div>
                <div className="flex flex-col gap-3">
                    <Skeleton variant="rectangle" height={108} />
                    <Skeleton variant="rectangle" height={132} />
                    <Skeleton variant="rectangle" height={108} />
                </div>
                <div className="mt-4"></div>
            </div>
        )
    }

    if (error || data?.documentStatus === 'errored') {
        return (
            <div className="max-w-prose">
                <div className="my-4">
                    <Heading size="small" level="3">
                        Kunne ikke skrive sykmeldingen til EPJ-systemet.
                    </Heading>
                </div>

                <div className="mt-4">
                    <Alert variant="error">Ukjent feil. Dersom problemet vedvarer, ta kontakt.</Alert>
                </div>

                <div className="mt-2">
                    <Button variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv igjen
                    </Button>
                </div>
            </div>
        )
    }

    if (!data || data.documentStatus !== 'complete') {
        return (
            <div className="mt-4">
                <Alert variant="warning">Data er ikke tilgjengelig ennå. Vennligst prøv igjen senere.</Alert>
                <div className="mt-4">
                    <Button variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv igjen
                    </Button>
                </div>
            </div>
        )
    }

    return <DocumentStatusSuccess />
}
