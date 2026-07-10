import { useMutation } from '@apollo/client/react'
import { Button, BodyShort } from '@navikt/ds-react'
import React from 'react'

import { useFlag } from '#core/toggles/context'
import { AllDashboardDocument, KonsultasjonDocument, RequestAccessToSykmeldingerDocument } from '#queries'

export function RequestHistoriske({ loading }: { loading: boolean }): React.ReactElement | null {
    const [requestAccessToSykmeldinger, result] = useMutation(RequestAccessToSykmeldingerDocument, {
        refetchQueries: [KonsultasjonDocument, AllDashboardDocument],
        awaitRefetchQueries: true,
    })

    // Allow a return null here to simplify the logic in the parent
    if (!useFlag('SYK_INN_REQUEST_HISTORISKE')) return null

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Button
                variant="secondary"
                onClick={() => {
                    void requestAccessToSykmeldinger()
                }}
                loading={loading || result.loading}
                disabled={loading}
            >
                Vis tidligere sykmeldinger
            </Button>
            <BodyShort spacing>Tilgang til sykmeldingshistorikk vil bli logget av Nav.</BodyShort>
        </div>
    )
}

export function HistoriskeSykmeldingerEmptyState(): React.ReactElement | null {
    // Allow a return null here to simplify the logic in the parent
    if (!useFlag('SYK_INN_REQUEST_HISTORISKE')) return null

    return (
        <div className="flex flex-col gap-6 items-center justify-center w-full h-24 text-ax-text-neutral-subtle">
            <BodyShort>Pasienten har ingen historiske sykmeldinger</BodyShort>
        </div>
    )
}
