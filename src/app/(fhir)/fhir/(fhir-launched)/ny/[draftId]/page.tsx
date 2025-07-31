'use client'

import React, { ReactElement, useEffect } from 'react'
import { useQuery } from '@apollo/client'

import { LoadablePageHeader } from '@components/layout/Page'
import { PasientDocument } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { isSmartSessionInvalid } from '@data-layer/graphql/error/Errors'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'

import { NoPractitionerSession } from '../../launched-errors'

function NySykmeldingWithContextPasientPage(): ReactElement {
    const { loading, data, error } = useQuery(PasientDocument)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (data?.pasient != null) {
            dispatch(
                nySykmeldingActions.activePatient({
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
        // Each step controls their own PageLayout
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Sykmelding for" value={data?.pasient?.navn ?? null} />}
        />
    )
}

export default NySykmeldingWithContextPasientPage
