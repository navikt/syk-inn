'use client'

import React, { ReactElement, useEffect } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'

import { useContextPasient } from '../../data-fetcher/hooks/use-context-pasient'
import { useContextKonsultasjon } from '../../data-fetcher/hooks/use-context-konsultasjon'
import { useAppDispatch } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import StepsSummary from './steps/StepsSummary'
import NySykmeldingFormSections from './NySykmeldingFormSections'

function NySykmeldingForm(): ReactElement {
    const { isLoading, data, error } = useContextPasient()
    const dispatch = useAppDispatch()

    // Preload data for next steps
    useContextKonsultasjon()

    useEffect(() => {
        if (data != null && !isLoading) {
            dispatch(
                nySykmeldingMultistepActions.autoPatient({
                    type: 'auto',
                    fnr: data.ident,
                    navn: data.navn,
                }),
            )
        }
    }, [dispatch, isLoading, data])

    if (error) {
        // Defer to global error handling
        throw error
    }

    return (
        <div className="mt-8">
            <Heading size="large" level="2" spacing className="flex gap-3">
                Sykmelding for{' '}
                {!isLoading && data ? <span>{data.navn}</span> : <Skeleton width={240} className="-my-4" />}
            </Heading>
            <div className="flex">
                <div className="w-full">
                    <NySykmeldingFormSections />
                </div>
                <div className="w-full ml-8">
                    <StepsSummary />
                </div>
            </div>
        </div>
    )
}

export default NySykmeldingForm
