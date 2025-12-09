import React, { ReactElement } from 'react'
import { Detail } from '@navikt/ds-react'

import { DraftValues } from '@data-layer/draft/draft-schema'
import { AkselNextLink } from '@components/links/AkselNextLink'
import { useMode } from '@core/providers/Modes'

import { draftPeriodeText } from './draft-utils'
import { AutoUpdatingDistance } from './AutoUpdatingDistance'

type Props = {
    draftId: string
    lastChanged: string
    perioder: DraftValues['perioder'] | undefined
}

function DraftPeriodeLink({ draftId, lastChanged, perioder }: Props): ReactElement {
    const mode = useMode()

    return (
        <div className="flex gap-3 items-start lg:items-center italic flex-col lg:flex-row">
            <AkselNextLink href={mode.paths.utkast(draftId)} prefetch={false}>
                {draftPeriodeText(perioder)}
            </AkselNextLink>
            <Detail className="text-xs">
                Sist endret <AutoUpdatingDistance time={lastChanged} />
            </Detail>
        </div>
    )
}

export default DraftPeriodeLink
