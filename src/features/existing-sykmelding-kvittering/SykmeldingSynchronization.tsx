import React, { ReactElement, useEffect } from 'react'
import { Alert, Button, Heading, Skeleton } from '@navikt/ds-react'
import { useMutation } from '@apollo/client'

import { DocumentStatusSuccess } from '@features/existing-sykmelding-kvittering/DocumentStatus'
import { SynchronizeSykmeldingDocument } from '@queries'
import { spanBrowserAsync } from '@core/otel/browser'

type Props = {
    sykmeldingId: string
}

export function SykmeldingSynchronization({ sykmeldingId }: Props): ReactElement {
    const [mutation, { loading, data, error }] = useMutation(SynchronizeSykmeldingDocument, {
        variables: { id: sykmeldingId },
    })

    useEffect(() => {
        spanBrowserAsync('SykmeldingSynchronization.mutation', async () => {
            await mutation()
        })
    }, [mutation])

    if (loading) {
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

    if (error || data?.synchronizeSykmelding.documentStatus === 'ERRORED') {
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
                    <Button variant="secondary-neutral" onClick={() => mutation()}>
                        Prøv igjen
                    </Button>
                </div>
            </div>
        )
    }

    if (!data || data.synchronizeSykmelding.documentStatus !== 'COMPLETE') {
        return (
            <div className="mt-4">
                <Alert variant="warning">Data er ikke tilgjengelig ennå. Vennligst prøv igjen senere.</Alert>
                <div className="mt-4">
                    <Button variant="secondary-neutral" onClick={() => mutation()}>
                        Prøv igjen
                    </Button>
                </div>
            </div>
        )
    }

    return <DocumentStatusSuccess />
}
