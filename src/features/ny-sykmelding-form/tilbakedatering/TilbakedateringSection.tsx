import React, { ReactElement } from 'react'

import TilbakedateringGrunn from './TilbakedateringGrunn'

function TilbakedateringSection(): ReactElement {
    return (
        <div className="flex flex-col gap-3">
            <TilbakedateringGrunn />
        </div>
    )
}

export default TilbakedateringSection
