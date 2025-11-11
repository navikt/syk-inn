'use client'

import React, { ReactElement } from 'react'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import HistoricalCard from '@features/dashboard/historical/HistoricalCard'
import ComboTableCard from '@features/dashboard/ComboTableCard'
import { PageLayout } from '@components/layout/Page'
import { useFlag } from '@core/toggles/context'

function DashboardPage(): ReactElement {
    const historiskeToggle = useFlag('SYK_INN_REQUEST_HISTORISKE')

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
