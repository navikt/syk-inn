'use client'

import React, { ReactElement, useEffect } from 'react'

import OpprettNySykmeldingCard from '@features/fhir/dashboard/OpprettNySykmeldingCard'
import HistoricalCard from '@features/fhir/dashboard/historical/HistoricalCard'
import ComboTableCard from '@features/fhir/dashboard/ComboTableCard'
import { PageLayout } from '@components/layout/Page'
import { useFlag } from '@core/toggles/context'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useAppDispatch } from '@core/redux/hooks'

function DashboardPage(): ReactElement {
    const dispatch = useAppDispatch()
    const historiskeToggle = useFlag('SYK_INN_REQUEST_HISTORISKE')

    useEffect(() => {
        /**
         * Make sure form is clear of any draft or submitted sykmeldinger when returning to dashboard.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <PageLayout heading="none" size="full" bg="transparent">
            <div className="grid grid-cols-2 gap-3 w-full">
                <OpprettNySykmeldingCard className="col-span-2" />
                <ComboTableCard className="min-h-80 col-span-2" />
                {historiskeToggle && <HistoricalCard className="col-span-2" />}
            </div>
        </PageLayout>
    )
}

export default DashboardPage
