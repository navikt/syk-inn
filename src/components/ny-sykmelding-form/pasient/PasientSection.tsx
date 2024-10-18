import React, { ReactElement } from 'react'

import { isResourceAvailable } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'
import { PasientSearchField } from '@components/ny-sykmelding-form/pasient/PasientSearchField'
import PasientInfo from '@components/ny-sykmelding-form/pasient/PasientInfo'

import { useNySykmeldingDataService } from '../data-provider/NySykmeldingFormDataProvider'

function PasientSection(): ReactElement {
    const dataService = useNySykmeldingDataService()

    if (isResourceAvailable(dataService.context.pasient)) {
        return <PasientInfo />
    }

    return <PasientSearchField />
}

export default PasientSection
