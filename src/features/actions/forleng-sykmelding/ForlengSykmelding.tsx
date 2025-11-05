'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { AllSykmeldingerDocument, SykmeldingByIdDocument } from '@queries'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { forlengSykmeldingDefaultValues } from '@features/actions/forleng-sykmelding/forleng-sykmelding-mappers'
import { SykmeldingFormErrors } from '@features/actions/common/SykmeldingFormErrors'
import { mapSykmeldingToDateRanges } from '@data-layer/common/continuous-sykefravaer-utils'
import { useAppSelector } from '@core/redux/hooks'

interface Props {
    sykmeldingId: string
}

export function ForlengSykmeldingFormWithDefaultValues({ sykmeldingId }: Props): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)

    if (suggestionsQuery.loading || sykmeldingQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const [derivedDefaultValues, nextFom] = forlengSykmeldingDefaultValues(
        sykmeldingQuery.data.sykmelding,
        valuesInState,
    )
    const previousSykmeldingDateRange = mapSykmeldingToDateRanges(alleSykmeldinger.data?.sykmeldinger ?? [])

    return (
        <NySykmeldingForm
            defaultValues={derivedDefaultValues}
            context={{
                previousSykmeldingDateRange,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            initialFom={nextFom}
        />
    )
}
