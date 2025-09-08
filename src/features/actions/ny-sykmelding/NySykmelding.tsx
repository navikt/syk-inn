'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { LoadablePageHeader } from '@components/layout/Page'
import { PasientDocument } from '@queries'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import { createDefaultFormValues } from '@features/ny-sykmelding-form/form-default-values'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'

function NySykmelding(): ReactElement {
    const { data } = useQuery(PasientDocument)

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Sykmelding for" value={data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormWithDefaultValues />
        </NySykmeldingPageSteps>
    )
}

function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)

    if (suggestionsQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    const defaultValues = createDefaultFormValues({
        valuesInState: valuesInState,
        serverSuggestions: suggestionsQuery.suggestions,
        draftValues: null,
    })

    return (
        <NySykmeldingForm
            defaultValues={defaultValues}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}

export default NySykmelding
