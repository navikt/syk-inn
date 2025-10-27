'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { AllSykmeldingerDocument, GetDraftDocument } from '@queries'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { createDefaultFormValues } from '@features/ny-sykmelding-form/form-default-values'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { SykmeldingDraftFormErrors } from '@features/actions/common/SykmeldingFormErrors'
import { mapSykmeldingToDateRanges } from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'

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
    const defaultValues = createDefaultFormValues({
        draftValues: parsedDraft,
        valuesInState: valuesInState,
        serverSuggestions: suggestionsQuery.suggestions,
    })

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
