import React, { ReactElement } from 'react'

import TilbakedateringDate from '@components/ny-sykmelding-form/tilbakedatering/TilbakedateringDate'
import TilbakedateringGrunn from '@components/ny-sykmelding-form/tilbakedatering/TilbakedateringGrunn'

function TilbakedateringSection(): ReactElement {
    return (
        <div className="flex flex-col gap-3">
            <TilbakedateringDate />
            <TilbakedateringGrunn />
        </div>
    )
}

export default TilbakedateringSection
