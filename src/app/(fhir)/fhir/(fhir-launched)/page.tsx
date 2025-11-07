'use client'

import React, { ReactElement } from 'react'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import ComboTableCard from '@features/dashboard/ComboTableCard'
import { PageLayout } from '@components/layout/Page'

function DashboardPage(): ReactElement {
    return (
        <PageLayout heading="none" size="full" bg="transparent">
            <div className="grid grid-cols-2 gap-3 w-full">
                <OpprettNySykmeldingCard className="col-span-2" />
                <ComboTableCard className="col-span-2" />
            </div>
        </PageLayout>
    )
}

export default DashboardPage
