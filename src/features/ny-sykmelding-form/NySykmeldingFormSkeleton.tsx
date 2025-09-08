import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'

function NySykmeldingFormSkeleton(): ReactElement {
    return (
        // Needs a much better skeleton
        <div className="grid grid-cols-2 gap-4 p-4">
            <Skeleton width="65ch" height={600} variant="rounded" />
            <Skeleton width="65ch" height={600} variant="rounded" />
        </div>
    )
}

export default NySykmeldingFormSkeleton
