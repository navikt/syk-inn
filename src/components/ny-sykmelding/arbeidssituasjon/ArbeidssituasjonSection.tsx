import { Detail } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { isResourceAvailable } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'
import ArbeidstakerWithDataField from '@components/ny-sykmelding/arbeidssituasjon/ArbeidstakerWithDataField'
import ArbeidstakerField from '@components/ny-sykmelding/arbeidssituasjon/ArbeidstakerField'

function ArbeidssituasjonSection(): ReactElement {
    const dataService = useNySykmeldingDataService()
    return (
        <div>
            <Detail spacing>Pasient sin arbeidssituasjon under sykmeldingsperioden</Detail>
            {isResourceAvailable(dataService.context.arbeidsgivere) ? (
                <ArbeidstakerWithDataField />
            ) : (
                <ArbeidstakerField />
            )}
        </div>
    )
}

export default ArbeidssituasjonSection
