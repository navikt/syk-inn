'use client'

import { useQuery } from '@apollo/client/react'
import React, { ReactElement } from 'react'

import { LoadablePageHeader } from '#components/layout/Page'
import { useAppSelector } from '#core/redux/hooks'
import { inferSykmeldingTypeFromDraft, safeParseDraft } from '#data-layer/draft/draft-schema'
import NySykmeldingFormSkeleton from '#features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import NySykmeldingFormVariants from '#features/ny-sykmelding-form/NySykmeldingFormVariants'
import NySykmeldingPageSteps from '#features/ny-sykmelding-form/NySykmeldingPageSteps'
import { useDiagnoseSuggestions } from '#features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import { GetDraftDocument, PasientDocument } from '#queries'

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
        return <NySykmeldingFormSkeleton lead="Ny sykmelding for" />
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
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Ny sykmelding for" value={pasient.data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormVariants
                variant={variantInDraft}
                defaultValues={defaultValues}
                context={{
                    utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
                }}
                contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            />
        </NySykmeldingPageSteps>
    )
}
