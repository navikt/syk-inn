import React, { ReactElement } from 'react'
import { Detail } from '@navikt/ds-react'

import { DraftValues } from '@data-layer/draft/draft-schema'
import { AkselNextLink } from '@components/links/AkselNextLink'

import { draftPeriodeText } from './draft-utils'
import { AutoUpdatingDistance } from './AutoUpdatingDistance'

type Props = {
    draftId: string
    lastChanged: string
    perioder: DraftValues['perioder'] | undefined
}

function DraftPeriodeLink({ draftId, lastChanged, perioder }: Props): ReactElement {
    return (
        <div className="flex gap-3 items-center italic">
            <AkselNextLink href={`/fhir/draft/${draftId}`}>{draftPeriodeText(perioder)}</AkselNextLink>
            <Detail className="text-xs">
                Sist endret <AutoUpdatingDistance time={lastChanged} />
            </Detail>
        </div>
    )
}

export default DraftPeriodeLink
