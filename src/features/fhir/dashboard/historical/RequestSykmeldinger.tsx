import { useMutation } from '@apollo/client/react'
import { Button, BodyShort } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { AllDashboardDocument, KonsultasjonDocument, RequestAccessToSykmeldingerDocument } from '@queries'

export function RequestSykmeldinger({ loading }: { loading: boolean }): ReactElement {
    const [requestAccessToSykmeldinger, result] = useMutation(RequestAccessToSykmeldingerDocument, {
        refetchQueries: [KonsultasjonDocument, AllDashboardDocument],
        awaitRefetchQueries: true,
    })

    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Button
                variant="secondary"
                onClick={() => {
                    requestAccessToSykmeldinger()
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
