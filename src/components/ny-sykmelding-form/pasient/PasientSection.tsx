import React, { ReactElement } from 'react'

import { PasientSearchField } from '@components/ny-sykmelding-form/pasient/PasientSearchField'
import PasientInfo from '@components/ny-sykmelding-form/pasient/PasientInfo'

import { isResourceAvailable } from '../../../data-fetcher/data-service'
import { useDataService } from '../../../data-fetcher/data-provider'

function PasientSection(): ReactElement {
    const dataService = useDataService()

    if (isResourceAvailable(dataService.context.pasient)) {
        return <PasientInfo />
    }

    return <PasientSearchField />
}

export default PasientSection
