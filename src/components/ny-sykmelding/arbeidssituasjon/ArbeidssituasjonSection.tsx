import { Detail } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { isResourceAvailable } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

import ArbeidsgiverWithDataField from './ArbeidsgiverWithDataField'
import ArbeidsgiverField from './ArbeidsgiverField'

function ArbeidssituasjonSection(): ReactElement {
    const dataService = useNySykmeldingDataService()
    return (
        <div>
            <Detail spacing>Pasient sin arbeidssituasjon under sykmeldingsperioden</Detail>
            {isResourceAvailable(dataService.context.arbeidsgivere) ? (
                <ArbeidsgiverWithDataField />
            ) : (
                <ArbeidsgiverField />
            )}
        </div>
    )
}

export default ArbeidssituasjonSection
