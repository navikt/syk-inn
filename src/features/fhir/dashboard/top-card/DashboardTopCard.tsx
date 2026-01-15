import React, { ReactElement, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'

import { cn } from '@lib/tw'
import { PasientDocument } from '@queries'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { LoadablePageHeader } from '@components/layout/Page'
import PatientStats from '@features/fhir/dashboard/top-card/dumb-stats/PatientStats'
import StartSykmelding from '@features/fhir/dashboard/top-card/StartSykmelding'

import DashboardCard from '../card/DashboardCard'

function DashboardTopCard({ className }: { className?: string }): ReactElement {
    const { data } = useQuery(PasientDocument)
    const dispatch = useAppDispatch()

    useEffect(() => {
        /**
         * Make sure form is reset for next sykmelding.
         *
         * If user returns to a ID it should be loaded from the draft, and any new ID should start with a fresh form.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <DashboardCard
            headingId="dashboard-opprett-ny-sykmelding"
            heading={
                <LoadablePageHeader
                    id="dashboard-opprett-ny-sykmelding"
                    lead="Oversikt over"
                    value={data?.pasient?.navn ?? null}
                    tail="sitt sykefravær"
                />
            }
            className={cn(className)}
        >
            <div className="flex flex-col ax-md:flex-row gap-3">
                <StartSykmelding />
                <div className="w-1 mt-2 mb-2 mx-2 ax-lg:mx-8 bg-ax-bg-neutral-soft shrink-0 self-stretch hidden ax-md:block"></div>
                <PatientStats />
            </div>
        </DashboardCard>
    )
}

export default DashboardTopCard
