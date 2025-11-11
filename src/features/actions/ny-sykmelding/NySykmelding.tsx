'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { AllSykmeldingerDocument } from '@queries'
import { useAppSelector } from '@core/redux/hooks'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import {
    mapSykmeldingToDateRanges,
    mergeCurrentAndPreviousSykmeldinger,
} from '@data-layer/common/continuous-sykefravaer-utils'
import { nySykmeldingDefaultValues } from '@features/actions/ny-sykmelding/ny-sykmelding-mappers'

export function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)

    if (suggestionsQuery.loading || alleSykmeldinger.loading) {
        return <NySykmeldingFormSkeleton />
    }

    const defaultValues = nySykmeldingDefaultValues(valuesInState, suggestionsQuery.suggestions)
    const previousSykmeldingDateRange = mapSykmeldingToDateRanges(
        mergeCurrentAndPreviousSykmeldinger(
            alleSykmeldinger.data?.sykmeldinger?.current,
            alleSykmeldinger.data?.sykmeldinger?.historical,
        ),
    )

    return (
        <NySykmeldingForm
            defaultValues={defaultValues}
            context={{
                previousSykmeldingDateRange,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}
