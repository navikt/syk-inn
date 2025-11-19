'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument } from '@queries'
import { useAppSelector } from '@core/redux/hooks'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { nySykmeldingDefaultValues } from '@features/actions/ny-sykmelding/ny-sykmelding-mappers'

export function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const pasient = useQuery(PasientDocument)

    if (suggestionsQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton />
    }

    const defaultValues = nySykmeldingDefaultValues(valuesInState, suggestionsQuery.suggestions)

    return (
        <NySykmeldingForm
            defaultValues={defaultValues}
            context={{
                utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}
