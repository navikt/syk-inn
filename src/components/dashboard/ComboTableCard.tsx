import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client'

import DashboardCard from '@components/dashboard/card/DashboardCard'
import { AllSykmeldingerDocument, GetAllDraftsDocument } from '@queries'
import { ComboTable } from '@components/dashboard/combo-table/ComboTable'

function ComboTableCard({ className }: { className?: string }): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllSykmeldingerDocument)

    return (
        <DashboardCard className={className} ariaLabel="Tidligere sykmeldinger og utkast">
            <ComboTable sykmeldinger={sykmeldinger.data?.sykmeldinger ?? []} drafts={allDrafts.data?.drafts ?? []} />
        </DashboardCard>
    )
}

export default ComboTableCard
