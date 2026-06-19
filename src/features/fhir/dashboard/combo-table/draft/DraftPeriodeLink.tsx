import { Detail } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { AkselNextLink } from '#components/links/AkselNextLink'
import { useMode } from '#core/providers/Modes'
import { DraftValues } from '#data-layer/draft/draft-schema'

import { AutoUpdatingDistance } from './AutoUpdatingDistance'
import { draftPeriodeText } from './draft-utils'

type Props = {
    draftId: string
    lastChanged: string
    perioder: DraftValues['perioder'] | undefined
}

function DraftPeriodeLink({ draftId, lastChanged, perioder }: Props): ReactElement {
    const mode = useMode()

    return (
        <div className="flex gap-3 items-start ax-lg:items-center italic flex-col ax-lg:flex-row">
            <AkselNextLink href={mode.paths.utkast(draftId)}>{draftPeriodeText(perioder)}</AkselNextLink>
            <Detail className="text-xs">
                Sist endret <AutoUpdatingDistance time={lastChanged} />
            </Detail>
        </div>
    )
}

export default DraftPeriodeLink
