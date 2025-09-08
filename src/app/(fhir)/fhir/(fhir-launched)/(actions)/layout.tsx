'use client'

import React, { ReactElement, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { isSmartSessionInvalid } from '@data-layer/fhir/error/Errors'

import { NoPractitionerSession } from '../launched-errors'

/**
 * All this layout does is makes sure the contextually active patient is active in the store
 */
function ActivePatientLayout({ children }: LayoutProps<'/fhir'>): ReactElement {
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

    return <>{children}</>
}

export default ActivePatientLayout
