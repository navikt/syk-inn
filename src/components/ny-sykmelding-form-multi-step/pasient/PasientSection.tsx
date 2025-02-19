import React, { ReactElement } from 'react'

import { isResourceAvailable } from '../../../data-fetcher/data-service'
import { useDataService } from '../../../data-fetcher/data-provider'

import { PasientSearchField } from './PasientSearchField'
import PasientInfo from './PasientInfo'

function PasientSection(): ReactElement {
    const dataService = useDataService()

    if (isResourceAvailable(dataService.context.pasient)) {
        return <PasientInfo />
    }

    return <PasientSearchField />
}

export default PasientSection
