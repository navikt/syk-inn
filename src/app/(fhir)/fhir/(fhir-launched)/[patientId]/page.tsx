'use client'

import React, { ReactElement, Suspense, useEffect } from 'react'

import { PageLayout } from '#components/layout/Page'
import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'
import { useFlag } from '#core/toggles/context'
import ComboTableCard from '#features/fhir/dashboard/ComboTableCard'
import HistoricalCard from '#features/fhir/dashboard/historical/HistoricalCard'
import DashboardTopCard from '#features/fhir/dashboard/top-card/DashboardTopCard'
import { WelcomeModal } from '#features/fhir/dashboard/welcome-modal/lazy'

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
                <DashboardTopCard className="col-span-2" />
                <ComboTableCard className="min-h-80 col-span-2" />
                {historiskeToggle && <HistoricalCard className="col-span-2" />}
            </div>
            <Suspense fallback={null}>
                <WelcomeModal />
            </Suspense>
        </PageLayout>
    )
}

export default DashboardPage
