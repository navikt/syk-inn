import { ChevronRightIcon } from '@navikt/aksel-icons'
import { Tooltip } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { SlowNextLinkButton } from '#components/links/SlowNextLinkButton'
import { useMode } from '#core/providers/Modes'

import { DeleteDraftButton } from './DeleteDraftButton'

export function DraftActions({ draftId }: { draftId: string }): ReactElement {
    const mode = useMode()

    return (
        <div className="grid grid-flow-col auto-cols-max gap-2">
            <Tooltip content="Åpne utkast">
                <SlowNextLinkButton
                    href={mode.paths.utkast(draftId)}
                    icon={<ChevronRightIcon aria-hidden />}
                    variant="tertiary"
                    size="small"
                />
            </Tooltip>

            <DeleteDraftButton draftId={draftId} />
        </div>
    )
}
