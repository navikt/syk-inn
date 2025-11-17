import React, { ReactElement, useEffect } from 'react'
import { Alert, BodyShort, Button, Skeleton } from '@navikt/ds-react'
import { useMutation } from '@apollo/client/react'

import { DocumentStatusSuccess } from '@features/sykmelding-kvittering/DocumentStatus'
import { SynchronizeSykmeldingDocument } from '@queries'
import { spanBrowserAsync } from '@lib/otel/browser'

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
        return <Skeleton variant="rounded" height={62} />
    }

    if (error || data?.synchronizeSykmelding.documentStatus === 'ERRORED') {
        return (
            <div className="max-w-prose">
                <Alert variant="error">Kunne ikke lagre sykmeldingen til EPJ-systemet ditt</Alert>

                <div className="mt-2 flex justify-between items-center px-4">
                    <BodyShort>Ukjent feil. Dersom problemet vedvarer, ta kontakt.</BodyShort>
                    <Button variant="secondary-neutral" onClick={() => mutation()} size="small">
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
