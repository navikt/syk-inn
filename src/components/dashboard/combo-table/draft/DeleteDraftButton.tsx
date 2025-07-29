import React, { ReactElement } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Tooltip } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'
import { toast } from 'sonner'
import { logger } from '@navikt/next-logger'

import { DeleteDraftDocument } from '@queries'
import { spanBrowserAsync } from '@core/otel/browser'
import { deleteDraftIdFromList } from '@data-layer/graphql/apollo/apollo-client-utils'

export function DeleteDraftButton({ draftId }: { draftId: string }): ReactElement {
    const [deleteDraft, deleteDraftResult] = useMutation(DeleteDraftDocument, {
        optimisticResponse: { __typename: 'Mutation', deleteDraft: true },
        update: (cache, result) => {
            if (result.data?.deleteDraft == true) {
                deleteDraftIdFromList(cache, draftId)
            }
        },
        onError: (e) => {
            toast.error('Klarte ikke å slette utkastet', { position: 'top-right', richColors: true })
            logger.error(e)
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
