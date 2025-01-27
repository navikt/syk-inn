import { Detail } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useDataService } from '../../../data-fetcher/data-provider'
import { isResourceAvailable } from '../../../data-fetcher/data-service'

import ArbeidsgiverWithDataField from './ArbeidsgiverWithDataField'
import ArbeidsgiverField from './ArbeidsgiverField'

function ArbeidssituasjonSection(): ReactElement {
    const dataService = useDataService()
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
