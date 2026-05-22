'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { GetDraftDocument, PasientDocument } from '@queries'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import { useAppSelector } from '@core/redux/hooks'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { inferSykmeldingTypeFromDraft, safeParseDraft } from '@data-layer/draft/draft-schema'
import NySykmeldingFormVariants from '@features/ny-sykmelding-form/NySykmeldingFormVariants'

import { SykmeldingDraftFormErrors } from '../common/SykmeldingFormErrors'

import { nySykmeldingFromDraftDefaultValues } from './ny-sykmelding-from-draft-mappers'

type Props = {
    draftId: string
}

export function DraftSykmeldingFormWithDefaultValues({ draftId }: Props): ReactElement {
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })
    const pasient = useQuery(PasientDocument)

    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const suggestionsQuery = useDiagnoseSuggestions()

    if (suggestionsQuery.loading || draftQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (draftQuery.error || draftQuery.data?.draft == null) {
        return <SykmeldingDraftFormErrors refetch={draftQuery.refetch} />
    }

    const parsedDraft = safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values)
    const variantInDraft = inferSykmeldingTypeFromDraft(parsedDraft)
    const defaultValues = nySykmeldingFromDraftDefaultValues(
        parsedDraft,
        valuesInState,
        suggestionsQuery.suggestions,
        variantInDraft,
    )

    return (
        <NySykmeldingFormVariants
            variant={variantInDraft}
            defaultValues={defaultValues}
            context={{
                utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
        />
    )
}
