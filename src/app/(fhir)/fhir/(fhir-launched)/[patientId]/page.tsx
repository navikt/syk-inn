'use client'

import React, { ReactElement, Suspense, useEffect } from 'react'

import { PageLayout } from '#components/layout/Page'
import { useAppDispatch } from '#core/redux/hooks'
import { nySykmeldingActions } from '#core/redux/reducers/ny-sykmelding'
import { SykmeldingerSection } from '#features/fhir/dashboard/SykmeldingerSection'
import { DashboardTopSection } from '#features/fhir/dashboard/top-card/DashboardTopSection'
import { WelcomeModal } from '#features/fhir/dashboard/welcome-modal/lazy'

function DashboardPage(): ReactElement {
    const dispatch = useAppDispatch()

    useEffect(() => {
        /**
         * Make sure form is clear of any draft or submitted sykmeldinger when returning to dashboard.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <PageLayout noHeading size="full" bg="white">
            <div className="grid grid-cols-2 w-full">
                <DashboardTopSection className="col-span-2" />
                <SykmeldingerSection className="min-h-80 col-span-2" />
            </div>
            <Suspense fallback={null}>
                <WelcomeModal />
            </Suspense>
        </PageLayout>
    )
}

export default DashboardPage
