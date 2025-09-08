import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { GetDraftDocument } from '@queries'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import { useDraftId } from '@features/ny-sykmelding-form/draft/useDraftId'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import { createDefaultFormValues } from '@features/ny-sykmelding-form/form-default-values'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'

import NySykmeldingForm from './NySykmeldingForm'

export function NySykmeldingFormWithDraftAndSuggestions(): ReactElement {
    const draftId = useDraftId()
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const suggestionsQuery = useDiagnoseSuggestions()

    if (suggestionsQuery.loading || draftQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    const parsedDraft = safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values)
    const defaultValues = createDefaultFormValues({
        draftValues: parsedDraft,
        valuesInState: valuesInState,
        serverSuggestions: suggestionsQuery.suggestions,
    })

    return (
        <NySykmeldingForm
            defaultValues={defaultValues}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}
