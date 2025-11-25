import React, { ReactElement, useEffect } from 'react'
import { BodyShort, Button, LocalAlert, Skeleton } from '@navikt/ds-react'
import { useMutation } from '@apollo/client/react'

import { DocumentStatusSuccess } from '@features/sykmelding-kvittering/DocumentStatus'
import { SynchronizeSykmeldingDocument } from '@queries'
import { spanBrowserAsync } from '@lib/otel/browser'

type Props = {
    sykmeldingId: string
}

export function SykmeldingSynchronization({ sykmeldingId }: Props): ReactElement {
    const [mutation, { loading, data, error, called }] = useMutation(SynchronizeSykmeldingDocument, {
        variables: { id: sykmeldingId },
    })

    useEffect(() => {
        spanBrowserAsync('SykmeldingSynchronization.mutation', async () => {
            await mutation()
        })
    }, [mutation])

    if (loading || !called) {
        return <Skeleton variant="rounded" height={48} />
    }

    if (error || data?.synchronizeSykmelding.documentStatus === 'ERRORED') {
        return (
            <LocalAlert status="error">
                <LocalAlert.Header>
                    <LocalAlert.Title>Kunne ikke lagre sykmeldingen til EPJ-systemet ditt</LocalAlert.Title>
                </LocalAlert.Header>
                <LocalAlert.Content>
                    <BodyShort spacing>Ukjent feil. Dersom problemet vedvarer, ta kontakt.</BodyShort>
                    <Button variant="secondary-neutral" onClick={() => mutation()} size="small">
                        Prøv igjen
                    </Button>
                </LocalAlert.Content>
            </LocalAlert>
        )
    }

    if (!data || data.synchronizeSykmelding.documentStatus !== 'COMPLETE') {
        return (
            <LocalAlert status="error">
                <LocalAlert.Header>
                    <LocalAlert.Title>Data er ikke tilgjengelig enda</LocalAlert.Title>
                </LocalAlert.Header>
                <LocalAlert.Content>
                    <BodyShort spacing>
                        Vi har forsøkt å lagre dokumentet i ditt EPJ-system. Det ser ikke ut som baksystemene er
                        synkroniserte enda.
                    </BodyShort>
                    <Button variant="secondary-neutral" onClick={() => mutation()} size="small">
                        Prøv igjen
                    </Button>
                </LocalAlert.Content>
            </LocalAlert>
        )
    }

    return <DocumentStatusSuccess />
}
