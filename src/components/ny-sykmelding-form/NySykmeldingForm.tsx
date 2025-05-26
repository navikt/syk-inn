'use client'

import React, { ReactElement, useEffect } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'

import { useContextPasient } from '../../data-layer/data-fetcher/hooks/use-context-pasient'
import { useContextKonsultasjon } from '../../data-layer/data-fetcher/hooks/use-context-konsultasjon'
import { useAppDispatch } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import NySykmeldingFormSections from './NySykmeldingFormSections'

function NySykmeldingForm(): ReactElement {
    const { isLoading, isSuccess, data, error } = useContextPasient()
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
        <>
            <Heading level="2" size="medium" spacing>
                <span>Sykmelding for</span>
                {isLoading && <Skeleton width={140} className="inline-block mx-2" />}
                {isSuccess && data && ` ${data.navn} `}
            </Heading>
            <div className="w-full">
                <NySykmeldingFormSections />
            </div>
        </>
    )
}

export default NySykmeldingForm
