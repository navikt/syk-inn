import React, { ReactElement } from 'react'
import { Reference, useMutation } from '@apollo/client'
import { Button, Tooltip } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'

import { DeleteDraftDocument, OpprettSykmeldingDraft } from '@queries'
import { spanBrowserAsync } from '@otel/browser'

export function DeleteDraftButton({ draftId }: { draftId: string }): ReactElement {
    const [deleteDraft, deleteDraftResult] = useMutation(DeleteDraftDocument, {
        optimisticResponse: { __typename: 'Mutation', deleteDraft: true },
        update: (cache, result) => {
            if (result.data?.deleteDraft == true) {
                if (draftId) {
                    cache.modify({
                        id: 'ROOT_QUERY',
                        fields: {
                            drafts: (existingDraftRefs: readonly Reference[], { readField }) =>
                                existingDraftRefs.filter((ref) => readField('draftId', ref) !== draftId),
                        },
                    })
                }

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
        <Tooltip content="Slett utkast">
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
        </Tooltip>
    )
}
