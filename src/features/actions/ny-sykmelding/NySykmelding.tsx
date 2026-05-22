'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument } from '@queries'
import { useAppSelector } from '@core/redux/hooks'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import NySykmeldingFormVariants from '@features/ny-sykmelding-form/NySykmeldingFormVariants'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useFormVariant } from '@features/ny-sykmelding-form/useFormVariant'

import { nySykmeldingDefaultValues } from './ny-sykmelding-mappers'

export function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const pasient = useQuery(PasientDocument)
    const variant = useFormVariant()

    if (suggestionsQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton />
    }

    const defaultValues = nySykmeldingDefaultValues(valuesInState, suggestionsQuery.suggestions, variant)

    return (
        <NySykmeldingFormVariants
            variant={variant}
            defaultValues={defaultValues}
            context={{
                utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}
