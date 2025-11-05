'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { AllSykmeldingerDocument, GetDraftDocument } from '@queries'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { SykmeldingDraftFormErrors } from '@features/actions/common/SykmeldingFormErrors'
import { mapSykmeldingToDateRanges } from '@data-layer/common/continuous-sykefravaer-utils'
import { nySykmeldingFromDraftDefaultValues } from '@features/actions/ny-sykmelding-from-draft/ny-sykmelding-from-draft-mappers'

type Props = {
    draftId: string
}

export function DraftSykmeldingFormWithDefaultValues({ draftId }: Props): ReactElement {
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })
    const alleSykmeldinger = useQuery(AllSykmeldingerDocument)

    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const suggestionsQuery = useDiagnoseSuggestions()

    if (suggestionsQuery.loading || draftQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (draftQuery.error || draftQuery.data?.draft == null) {
        return <SykmeldingDraftFormErrors refetch={draftQuery.refetch} />
    }

    const parsedDraft = safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values)
    const defaultValues = nySykmeldingFromDraftDefaultValues(parsedDraft, valuesInState, suggestionsQuery.suggestions)
    const previousSykmeldingDateRange = mapSykmeldingToDateRanges(alleSykmeldinger.data?.sykmeldinger ?? [])

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
