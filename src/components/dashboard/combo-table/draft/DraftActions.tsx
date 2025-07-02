import React, { ReactElement } from 'react'
import { Button, Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon } from '@navikt/aksel-icons'

import AssableNextLink from '@components/misc/AssableNextLink'
import { DeleteDraftButton } from '@components/dashboard/combo-table/draft/DeleteDraftButton'

export function DraftActions({ draftId }: { draftId: string }): ReactElement {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit ml-2">
            <Tooltip content="Åpne utkast">
                <Button
                    as={AssableNextLink}
                    href={`/fhir/ny/${draftId}`}
                    icon={<ChevronRightIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </Tooltip>
            <Tooltip content="Slett utkast">
                <DeleteDraftButton draftId={draftId} />
            </Tooltip>
        </div>
    )
}
