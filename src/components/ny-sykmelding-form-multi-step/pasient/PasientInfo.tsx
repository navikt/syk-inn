import React, { ReactElement, useEffect, useState } from 'react'
import { UseQueryResult } from '@tanstack/react-query'
import { Alert, BodyShort, Button, Detail, Skeleton } from '@navikt/ds-react'

import SubtleRetryIndicator from '@components/misc/SubtleRetryIndicator'

import { useContextPasient } from '../../../data-fetcher/hooks/use-context-pasient'
import { useAppDispatch, useAppSelector } from '../../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import { PasientSearchField } from './PasientSearchField'

const FASTLEGE_INFO_ENABLED = false

function PasientInfo(): ReactElement {
    const [overridePasient, setOverridePasient] = useState(false)
    const pasientQuery = useContextPasient()
    const dispatch = useAppDispatch()
    const step = useAppSelector((state) => state.nySykmeldingMultistep.pasient)

    useEffect(() => {
        if (pasientQuery.error == null && pasientQuery.data != null && step == null) {
            dispatch(nySykmeldingMultistepActions.autoPatient({ type: 'auto', fnr: pasientQuery.data.ident }))
        }
    }, [dispatch, pasientQuery.data, pasientQuery.error, step])

    if (pasientQuery.error) {
        return (
            <PasientSearchField>
                <PasientInfoDegredationInfo query={pasientQuery} />
            </PasientSearchField>
        )
    }

    if (overridePasient) {
        return (
            <PasientSearchField>
                <div className="flex my-2">
                    <BodyShort>Du har valgt å bruke en annen pasient enn den som er hentet fra EPJ.</BodyShort>
                    <div className="shrink-0 ml-2">
                        <Button
                            type="button"
                            variant="secondary-neutral"
                            size="xsmall"
                            onClick={() => setOverridePasient(false)}
                        >
                            Bytt til systempasient
                        </Button>
                    </div>
                </div>
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
                    <div className="flex justify-between">
                        <div>
                            <Detail>Navn</Detail>
                            <BodyShort spacing>{pasientQuery.data.navn}</BodyShort>
                        </div>
                        <div className="mt-2">
                            <Button
                                type="button"
                                variant="secondary-neutral"
                                size="xsmall"
                                onClick={() => setOverridePasient(true)}
                            >
                                Endre pasient
                            </Button>
                        </div>
                    </div>
                    <Detail>ID-nummer</Detail>
                    <BodyShort spacing>{pasientQuery.data.ident}</BodyShort>
                    {FASTLEGE_INFO_ENABLED && (
                        <>
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
                        </>
                    )}
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
