import React, { ReactElement } from 'react'
import { UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Detail, Skeleton } from '@navikt/ds-react'

import { PasientSearchField } from '@components/ny-sykmelding-form/pasient/PasientSearchField'
import SubtleRetryIndicator from '@components/misc/SubtleRetryIndicator'
import { useFormContext } from '@components/ny-sykmelding-form/NySykmeldingFormValues'

import { useContextPasient } from '../../../data-fetcher/hooks/use-context-pasient'
import type { PasientInfo } from '../../../data-fetcher/data-service'

function PasientInfo(): ReactElement {
    const pasientQuery = useContextPasient()
    const formContext = useFormContext()

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
                    <BodyShort spacing>
                        {pasientQuery.data.oid?.nr ?? 'ukjent'}{' '}
                        {pasientQuery.data.oid?.type && (
                            <span className="text-xs">({oidTypeToReadableText(pasientQuery.data.oid.type)})</span>
                        )}
                    </BodyShort>
                    <Detail>Fastlege</Detail>
                    <BodyShort>
                        {pasientQuery.data.fastlege ? (
                            <>
                                {pasientQuery.data.fastlege.navn}{' '}
                                <span className="text-xs">({pasientQuery.data.fastlege.hpr})</span>
                            </>
                        ) : (
                            <>Ingen registrert fastlege</>
                        )}
                    </BodyShort>
                    <input {...formContext.register('pasient')} type="hidden" value={pasientQuery.data.oid?.nr} />
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

function oidTypeToReadableText(type: NonNullable<PasientInfo['oid']>['type']): string {
    switch (type) {
        case 'fnr':
            return 'fødselsnummer'
        case 'dnr':
            return 'd-nummer'
        default:
            return 'ukjent nummer'
    }
}

export default PasientInfo
