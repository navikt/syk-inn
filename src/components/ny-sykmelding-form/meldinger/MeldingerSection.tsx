import React, { ReactElement } from 'react'

import MeldingTilNavField from '@components/ny-sykmelding-form/meldinger/MeldingTilNavField'
import MeldingTilArbeidsgiverField from '@components/ny-sykmelding-form/meldinger/MeldingTilArbeidsgiverField'

function MeldingerSection(): ReactElement {
    return (
        <div className="flex flex-col gap-4">
            <MeldingTilNavField />
            <MeldingTilArbeidsgiverField />
        </div>
    )
}

export default MeldingerSection
