import React, { ReactElement, useEffect } from 'react'
import { Skeleton } from '@navikt/ds-react'
import { useMutation } from '@apollo/client/react'

import { DocumentStatusSuccess } from '@features/sykmelding-kvittering/DocumentStatus'
import { SynchronizeSykmeldingDocument } from '@queries'
import { spanBrowserAsync } from '@lib/otel/browser'
import { SimpleAlert } from '@components/help/GeneralErrors'

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
            <SimpleAlert
                level="error"
                size="small"
                title="Kunne ikke lagre sykmeldingen til EPJ-systemet ditt"
                retry={() => mutation()}
            >
                Ukjent feil. Dersom problemet vedvarer, ta kontakt.
            </SimpleAlert>
        )
    }

    if (!data || data.synchronizeSykmelding.documentStatus !== 'COMPLETE') {
        return (
            <SimpleAlert level="error" title="Data er ikke tilgjengelig enda" retry={() => mutation()}>
                Vi har forsøkt å lagre dokumentet i ditt EPJ-system. Det ser ikke ut som baksystemene er synkroniserte
                enda.
            </SimpleAlert>
        )
    }

    return <DocumentStatusSuccess />
}
