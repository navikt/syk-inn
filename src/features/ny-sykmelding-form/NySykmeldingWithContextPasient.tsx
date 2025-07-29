'use client'

import React, { ReactElement, useEffect } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import { PasientDocument } from '@queries'
import { isSmartSessionInvalid } from '@data-layer/graphql/error/Errors'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'

import { NoPractitionerSession } from '../../app/(fhir)/fhir/(fhir-launched)/launched-errors'

import NySykmeldingFormSteps from './NySykmeldingFormSteps'

function NySykmeldingWithContextPasient(): ReactElement {
    const { loading, data, error } = useQuery(PasientDocument)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (data?.pasient != null) {
            dispatch(
                nySykmeldingActions.autoPatient({
                    type: 'auto',
                    ident: data.pasient.ident,
                    navn: data.pasient.navn,
                }),
            )
        }
    }, [dispatch, loading, data])

    if (error) {
        if (isSmartSessionInvalid(error)) {
            return <NoPractitionerSession />
        }

        // Defer to global error handling
        throw error
    }

    return (
        <>
            <div>
                <Heading level="2" size="medium" spacing>
                    <span>Sykmelding for</span>
                    {loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {data?.pasient && ` ${data.pasient.navn} `}
                </Heading>
            </div>
            <div className="w-full">
                <NySykmeldingFormSteps />
            </div>
        </>
    )
}

export default NySykmeldingWithContextPasient
