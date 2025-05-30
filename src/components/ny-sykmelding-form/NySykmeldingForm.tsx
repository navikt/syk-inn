'use client'

import React, { ReactElement, useEffect } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import { PasientDocument } from '@queries'

import { useAppDispatch } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import NySykmeldingFormSections from './NySykmeldingFormSections'

function NySykmeldingForm(): ReactElement {
    const { loading, data, error } = useQuery(PasientDocument)
    const dispatch = useAppDispatch()

    // Preload data for next steps
    // useContextKonsultasjon()

    useEffect(() => {
        if (data?.pasient != null) {
            dispatch(
                nySykmeldingMultistepActions.autoPatient({
                    type: 'auto',
                    ident: data.pasient.ident,
                    navn: data.pasient.navn,
                }),
            )
        }
    }, [dispatch, loading, data])

    if (error) {
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
                <NySykmeldingFormSections />
            </div>
        </>
    )
}

export default NySykmeldingForm
