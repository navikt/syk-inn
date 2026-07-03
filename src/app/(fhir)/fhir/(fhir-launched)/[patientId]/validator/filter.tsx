'use client'

import { Switch } from '@navikt/ds-react'
import { useQueryState, parseAsBoolean } from 'nuqs'
import React, { ReactElement } from 'react'

export function Filter(): ReactElement {
    const [showEverything, setShowEverything] = useQueryState(
        'full',
        parseAsBoolean.withDefault(false).withOptions({ shallow: false }),
    )

    return (
        <div>
            <Switch checked={showEverything} onChange={(e) => setShowEverything(e.target.checked)}>
                Vis hele rapporten
            </Switch>
        </div>
    )
}
