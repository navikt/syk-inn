import React, { ReactElement } from 'react'
import { Tooltip } from '@navikt/ds-react'
import { ChevronRightIcon } from '@navikt/aksel-icons'

import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'

import { DeleteDraftButton } from './DeleteDraftButton'

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

            <DeleteDraftButton draftId={draftId} />
        </div>
    )
}
