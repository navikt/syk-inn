import React, { ReactElement } from 'react'

import TilbakedateringDate from './TilbakedateringDate'
import TilbakedateringGrunn from './TilbakedateringGrunn'

function TilbakedateringSection(): ReactElement {
    return (
        <div className="flex flex-col gap-3">
            <TilbakedateringDate />
            <TilbakedateringGrunn />
        </div>
    )
}

export default TilbakedateringSection
