import React, { ReactElement } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Detail, Skeleton } from '@navikt/ds-react'

import { assertResourceAvailable } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { PasientSearchField } from '@components/ny-sykmelding-form/pasient/PasientSearchField'
import SubtleRetryIndicator from '@components/misc/SubtleRetryIndicator'

import { useNySykmeldingDataService } from '../data-provider/NySykmeldingFormDataProvider'

function PasientInfo(): ReactElement {
    const dataService = useNySykmeldingDataService()
    const pasientQuery = useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            assertResourceAvailable(dataService.context.pasient)

            return dataService.context.pasient()
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
            <Detail spacing>
                Pasientdetaljer hentet fra EPJ <SubtleRetryIndicator failureCount={pasientQuery.failureCount} />
            </Detail>
            {pasientQuery.isLoading && (
                <div>
                    <Detail>Navn</Detail>
                    <Skeleton width="40%" className="mb-3" />
                    <Detail>ID-nummer</Detail>
                    <Skeleton width="60%" />
                </div>
            )}
            {pasientQuery.data && (
                <div>
                    <Detail>Navn</Detail>
                    <BodyShort spacing>{pasientQuery.data.navn}</BodyShort>
                    <Detail>ID-nummer</Detail>
                    <BodyShort>
                        {pasientQuery.data.oid?.nr ?? 'ukjent'}{' '}
                        {pasientQuery.data.oid?.type && <span className="text-xs">({pasientQuery.data.oid.type})</span>}
                    </BodyShort>
                </div>
            )}
        </div>
    )
}

function PasientInfoDegredationInfo({ query }: { query: UseQueryResult }): ReactElement {
    return (
        <Alert variant="warning" className="my-2">
            <BodyShort spacing>
                Det var ikke mulig å hente pasienten din akkurat nå. Du kan enten{' '}
                <Button
                    size="xsmall"
                    variant="secondary-neutral"
                    onClick={() => query.refetch()}
                    loading={query.isRefetching}
                    type="button"
                >
                    prøve på nytt
                </Button>
                , eller prøve igjen senere.
            </BodyShort>
            <BodyShort>Du kan fortsette utfyllingen ved å manuelt hente opp pasienten dersom du ønsker.</BodyShort>
        </Alert>
    )
}

export default PasientInfo
