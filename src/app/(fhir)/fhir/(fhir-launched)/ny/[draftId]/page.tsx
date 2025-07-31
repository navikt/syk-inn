'use client'

import React, { ReactElement, useEffect } from 'react'
import { useQuery } from '@apollo/client'

import { LoadablePageHeader, PageLayout } from '@components/layout/Page'
import { PasientDocument } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { isSmartSessionInvalid } from '@data-layer/graphql/error/Errors'
import NySykmeldingFormSteps from '@features/ny-sykmelding-form/NySykmeldingFormSteps'

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
        <PageLayout heading={<LoadablePageHeader lead="Sykmelding for" value={data?.pasient?.navn ?? null} />}>
            <div className="w-full">
                <NySykmeldingFormSteps />
            </div>
        </PageLayout>
    )
}

export default NySykmeldingWithContextPasientPage
