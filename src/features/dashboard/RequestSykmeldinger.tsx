import { useMutation } from '@apollo/client/react'
import { Button, BodyShort } from '@navikt/ds-react'
import { ReactElement } from 'react'

import {
    AllSykmeldingerDocument,
    KonsultasjonDocument,
    RequestAccessToSykmeldingerDocument,
} from '@data-layer/graphql/generated/queries.generated'

export function RequestSykmeldinger(): ReactElement {
    const [requestAccessToSykmeldinger, result] = useMutation(RequestAccessToSykmeldingerDocument, {
        refetchQueries: [AllSykmeldingerDocument, KonsultasjonDocument],
        awaitRefetchQueries: true,
    })
    return (
        <div className="flex flex-col items-center justify-center gap-3 p-8">
            <Button
                variant="secondary"
                onClick={() => {
                    requestAccessToSykmeldinger()
                }}
                loading={result.loading}
            >
                Be om tilgang til sykmeldinger
            </Button>
            <BodyShort spacing>Du må be om tilgang for å kunne se sykmeldingshistorikk på pasienten.</BodyShort>
        </div>
    )
}
