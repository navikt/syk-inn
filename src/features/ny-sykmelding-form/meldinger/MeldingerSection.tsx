import React, { ReactElement } from 'react'

import MeldingTilNavField from './MeldingTilNavField'
import MeldingTilArbeidsgiverField from './MeldingTilArbeidsgiverField'

function MeldingerSection(): ReactElement {
    return (
        <div className="flex flex-col gap-2">
            <MeldingTilNavField />
            <MeldingTilArbeidsgiverField />
        </div>
    )
}

export default MeldingerSection
