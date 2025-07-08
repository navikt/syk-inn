import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { Button } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'

import { DeleteDraftDocument, GetAllDraftsDocument, OpprettSykmeldingDraft } from '@queries'
import { spanBrowserAsync } from '@otel/browser'

export function DeleteDraftButton({ draftId }: { draftId: string }): ReactElement {
    const [deleteDraft, deleteDraftResult] = useMutation(DeleteDraftDocument, {
        refetchQueries: [{ query: GetAllDraftsDocument }],
        awaitRefetchQueries: true,
        update: (cache, result) => {
            if (result.data?.deleteDraft == true) {
                cache.evict({
                    id: cache.identify({
                        __typename: 'OpprettSykmeldingDraft',
                        draftId,
                    } satisfies Partial<OpprettSykmeldingDraft>),
                })
            }
        },
    })

    return (
        <Button
            icon={<TrashIcon aria-hidden />}
            size="small"
            variant="tertiary"
            loading={deleteDraftResult.loading}
            onClick={() =>
                spanBrowserAsync('DeleteDraft(Dashboard).mutation', async () =>
                    deleteDraft({
                        variables: { draftId },
                    }),
                )
            }
        />
    )
}
