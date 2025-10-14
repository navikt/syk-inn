'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { AllSykmeldingerDocument, PasientDocument, SykmeldingByIdDocument } from '@queries'
import { LoadablePageHeader } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { SykmeldingFormErrors } from '@features/actions/common/SykmeldingFormErrors'
import { dupliserSykmeldingDefaultValues } from '@features/actions/dupliser-sykmelding/dupliser-sykmelding-mapper'
import { mapSykmeldingToDateRanges } from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'

interface Props {
    sykmeldingId: string
}

function DupliserSykmelding({ sykmeldingId }: Props): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <NySykmeldingPageSteps
            heading={
                <LoadablePageHeader lead="Dupliser sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />
            }
        >
            <DupliserSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPageSteps>
    )
}

function DupliserSykmeldingFormWithDefaultValues({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)

    if (suggestionsQuery.loading || sykmeldingQuery.loading || alleSykmeldinger.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const derivedDefaultValues = dupliserSykmeldingDefaultValues(sykmeldingQuery.data.sykmelding)

    const previousSykmeldingDateRange = mapSykmeldingToDateRanges(alleSykmeldinger.data?.sykmeldinger ?? [])

    return (
        <NySykmeldingForm
            defaultValues={derivedDefaultValues}
            context={{
                previousSykmeldingDateRange,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}

export default DupliserSykmelding
