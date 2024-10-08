import React, { ReactElement } from 'react'

import { isResourceAvailable } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'
import { PasientSearchField } from '@components/ny-sykmelding/pasient/PasientSearchField'
import PasientInfo from '@components/ny-sykmelding/pasient/PasientInfo'

import { useNySykmeldingDataService } from '../data-provider/NySykmeldingFormDataProvider'

function PasientSection(): ReactElement {
    const dataService = useNySykmeldingDataService()

    if (isResourceAvailable(dataService.context.getPasient)) {
        return <PasientInfo />
    }

    return <PasientSearchField />
}

export default PasientSection
