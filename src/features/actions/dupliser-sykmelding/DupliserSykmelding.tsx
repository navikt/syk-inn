'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { LoadablePageHeader } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { SykmeldingFormErrors } from '@features/actions/common/SykmeldingFormErrors'
import { dupliserSykmeldingDefaultValues } from '@features/actions/dupliser-sykmelding/dupliser-sykmelding-mapper'

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

    if (suggestionsQuery.loading || sykmeldingQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const derivedDefaultValues = dupliserSykmeldingDefaultValues(sykmeldingQuery.data.sykmelding)

    return (
        <NySykmeldingForm
            defaultValues={derivedDefaultValues}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}

export default DupliserSykmelding
