import React, { ReactElement } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon } from '@navikt/aksel-icons'

import { DeleteDraftButton } from '@components/dashboard/combo-table/draft/DeleteDraftButton'
import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'

export function DraftActions({ draftId }: { draftId: string }): ReactElement {
    return (
        <div className="grid grid-cols-3 gap-2 w-fit ml-2">
            <Tooltip content="Åpne utkast">
                <SlowNextLinkButton
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
