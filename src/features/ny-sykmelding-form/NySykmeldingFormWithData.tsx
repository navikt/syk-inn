import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'

import { GetDraftDocument } from '@queries'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import { useDraftId } from '@features/ny-sykmelding-form/draft/useDraftId'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'

import NySykmeldingForm from './NySykmeldingForm'

function NySykmeldingFormWithData(): ReactElement {
    const draftId = useDraftId()
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })
    const suggestionsQuery = useDiagnoseSuggestions()

    if (suggestionsQuery.loading || draftQuery.loading) {
        return (
            // Needs a much better skeleton
            <div className="grid grid-cols-2 gap-4 p-4">
                <Skeleton width="65ch" height={600} variant="rounded" />
                <Skeleton width="65ch" height={600} variant="rounded" />
            </div>
        )
    }

    return (
        <NySykmeldingForm
            draftValues={safeParseDraft(draftQuery.data?.draft?.draftId, draftQuery.data?.draft?.values)}
            initialServerValues={suggestionsQuery.suggestions}
        />
    )
}

export default NySykmeldingFormWithData
