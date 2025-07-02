import React, { ReactElement } from 'react'
import { Detail, Link as AkselLink } from '@navikt/ds-react'
import Link from 'next/link'

import { draftPeriodeText } from '@components/dashboard/combo-table/draft/draft-utils'
import { AutoUpdatingDistance } from '@components/dashboard/combo-table/draft/AutoUpdatingDistance'

import { DraftValues } from '../../../../data-layer/draft/draft-schema'

type Props = {
    draftId: string
    lastChanged: string
    perioder: DraftValues['perioder'] | undefined
}

function DraftPeriodeLink({ draftId, lastChanged, perioder }: Props): ReactElement {
    return (
        <div className="flex gap-3 items-center">
            <AkselLink as={Link} href={`/fhir/ny/${draftId}`}>
                {draftPeriodeText(perioder)}
            </AkselLink>
            <Detail className="text-xs">
                Sist endret <AutoUpdatingDistance time={lastChanged} />
            </Detail>
        </div>
    )
}

export default DraftPeriodeLink
