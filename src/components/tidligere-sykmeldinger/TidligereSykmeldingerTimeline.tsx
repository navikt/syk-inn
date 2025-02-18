'use client'

import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'

import { DataService, isResourceAvailable } from '../../data-fetcher/data-service'
import { useDataService } from '../../data-fetcher/data-provider'

function TidligereSykmeldingerTimeline(): ReactElement {
    const dataService: DataService = useDataService()

    if (isResourceAvailable(dataService.context.tidligereSykmeldinger)) {
        const tidligereSykmeldinger = await dataService.context.tidligereSykmeldinger

        logger.info(`tidligereSykmeldinger json: ${JSON.stringify(tidligereSykmeldinger)}`)

        return (
            <div>
                {tidligereSykmeldinger.g}
                <h1>Tidligere sykmeldinger</h1>{' '}
            </div>
        )
    } else {
        return (
            <div>
                <h1>Fant ikkje tidligere sykmeldinger, pga fant ikkje pasient</h1>
            </div>
        )
    }
}

export default TidligereSykmeldingerTimeline
