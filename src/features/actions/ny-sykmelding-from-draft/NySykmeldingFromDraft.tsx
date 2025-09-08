'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { GetDraftDocument, PasientDocument } from '@queries'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { LoadablePageHeader } from '@components/layout/Page'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { createDefaultFormValues } from '@features/ny-sykmelding-form/form-default-values'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'

function NySykmeldingFromDraft({ draftId }: { draftId: string }): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />}
        >
            <DraftSykmeldingFormWithDefaultValues draftId={draftId} />
        </NySykmeldingPageSteps>
    )
}

function DraftSykmeldingFormWithDefaultValues({ draftId }: { draftId: string }): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })

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

export default NySykmeldingFromDraft
