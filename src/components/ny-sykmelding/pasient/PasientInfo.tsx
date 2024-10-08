import React, { ReactElement } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'

import { assertResourceAvailable } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'
import { PasientSearchField } from '@components/ny-sykmelding/pasient/PasientSearchField'

import { useNySykmeldingDataService } from '../data-provider/NySykmeldingFormDataProvider'

function PasientInfo(): ReactElement {
    const dataService = useNySykmeldingDataService()
    const pasientQuery = useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            assertResourceAvailable(dataService.context.getPasient)

            return dataService.context.getPasient()
        },
    })

    if (pasientQuery.error) {
        return (
            <PasientSearchField>
                <PasientInfoDegredationInfo query={pasientQuery} />
            </PasientSearchField>
        )
    }

    return (
        <div>
            <Heading level="3" size="medium">
                Pasientinfo
            </Heading>
            {pasientQuery.isLoading && <p>Laster pasientinfo...</p>}
            {pasientQuery.data && (
                <p>
                    Pasient: {pasientQuery.data.navn}, {pasientQuery.data.fnr}
                </p>
            )}
        </div>
    )
}

function PasientInfoDegredationInfo({ query }: { query: UseQueryResult }): ReactElement {
    return (
        <Alert variant="warning">
            <BodyShort spacing>
                Det var ikke mulig å hente pasienten din akkurat nå. Du kan enten{' '}
                <Button size="xsmall" variant="secondary" onClick={() => query.refetch()} loading={query.isRefetching}>
                    prøve på nytt
                </Button>
                , eller prøve igjen senere.
            </BodyShort>
            <BodyShort>Du kan fortsette utfyllingen ved å manuelt hente opp pasienten dersom du ønsker.</BodyShort>
        </Alert>
    )
}

export default PasientInfo
