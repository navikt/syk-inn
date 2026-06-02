'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument } from '@queries'
import { useAppSelector } from '@core/redux/hooks'
import { LoadablePageHeader } from '@components/layout/Page'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import NySykmeldingFormVariants from '@features/ny-sykmelding-form/NySykmeldingFormVariants'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { useFormVariant } from '@features/ny-sykmelding-form/useFormVariant'

import { nySykmeldingDefaultValues } from './ny-sykmelding-mappers'

export function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const pasient = useQuery(PasientDocument)
    const variant = useFormVariant()

    if (suggestionsQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton lead="Sykmelding for" />
    }

    const defaultValues = nySykmeldingDefaultValues(valuesInState, suggestionsQuery.suggestions, variant)

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Sykmelding for" value={pasient.data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormVariants
                variant={variant}
                defaultValues={defaultValues}
                context={{
                    utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
                }}
                contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            />
        </NySykmeldingPageSteps>
    )
}
