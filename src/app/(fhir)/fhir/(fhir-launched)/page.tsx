'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import { KonsultasjonDocument } from '@queries'
import ComboTableCard from '@features/dashboard/ComboTableCard'
import { PageLayout } from '@components/layout/Page'
import useOnFocus from '@lib/hooks/useOnFocus'

function DashboardPage(): ReactElement {
    // Preload Konsultasjon (with diagnosis) for the form, we refetch it on focus so that new diagnoses suggested
    const konsultasjonDocument = useQuery(KonsultasjonDocument)
    useOnFocus(konsultasjonDocument.refetch)

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
