import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import { DiagnoseFragment, GetDraftDocument, KonsultasjonDocument } from '@queries'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import { useDraftId } from '@features/ny-sykmelding-form/draft/useDraftId'

import NySykmeldingForm from './NySykmeldingForm'

function NySykmeldingFormWithData(): ReactElement {
    const draftId = useDraftId()
    const konsultasjonsQuery = useQuery(KonsultasjonDocument)
    const draftQuery = useQuery(GetDraftDocument, {
        variables: { draftId },
        fetchPolicy: 'cache-first',
    })

    if (konsultasjonsQuery.loading || draftQuery.loading) {
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
            initialServerValues={{
                diagnose: {
                    value: pickMostRelevantDiagnose(konsultasjonsQuery.data?.konsultasjon?.diagnoser ?? null),
                    error: konsultasjonsQuery.error ? { error: 'FHIR_FAILED' } : undefined,
                },
            }}
        />
    )
}

function pickMostRelevantDiagnose(diagnoser: DiagnoseFragment[] | null): DiagnoseFragment | null {
    if (!diagnoser || diagnoser.length === 0) {
        return null
    }

    return diagnoser[0]
}

export default NySykmeldingFormWithData
