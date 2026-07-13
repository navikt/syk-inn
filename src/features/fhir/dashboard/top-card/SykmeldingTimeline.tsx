import { useQuery } from '@apollo/client/react'
import { BandageIcon } from '@navikt/aksel-icons'
import { Timeline } from '@navikt/ds-react'
import { addDays, parseISO } from 'date-fns/fp'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { earliestFom, getAllSykmeldingerFromQuery, latestTom } from '#data-layer/common/sykmelding-utils'
import { toReadableDatePeriod } from '#lib/date'
import { AllDashboardDocument, SykmeldingFragment } from '#queries'

import { sykmeldingGradText } from '../combo-table/sykmelding/sykmelding-utils'

export function SykmeldingTimeline(): ReactElement {
    const { loading, data, error } = useQuery(AllDashboardDocument)

    if (loading) {
        return <div>Loading timeline...</div>
    }

    if (error) {
        return <div>ewwow :(</div>
    }

    const allSykmeldinger = getAllSykmeldingerFromQuery(data?.sykmeldinger)
    return (
        <div className="mb-8">
            {R.hasAtLeast(allSykmeldinger, 1) ? <FullTimeline sykmeldinger={allSykmeldinger} /> : <div>empty</div>}
        </div>
    )
}

function FullTimeline({ sykmeldinger }: { sykmeldinger: [SykmeldingFragment, ...SykmeldingFragment[]] }): ReactElement {
    const latest = R.pipe(sykmeldinger, R.map(latestTom), R.firstBy([R.identity(), 'desc']), parseISO, addDays(1))
    const lanes = partitionLanes(sykmeldinger)

    return (
        <Timeline endDate={latest}>
            {lanes.map((lane, index) => (
                <Timeline.Row key={index} label="Sykmeldinger">
                    {lane.map((it) => {
                        const fom = parseISO(earliestFom(it))
                        const tom = parseISO(latestTom(it))

                        return (
                            <Timeline.Period
                                key={it.sykmeldingId}
                                start={fom}
                                end={tom}
                                statusLabel="Hey"
                                status="success"
                                icon={<BandageIcon />}
                            >
                                {it.values.__typename !== 'SykmeldingRedactedValues'
                                    ? `${sykmeldingGradText(it.values.aktivitet)}, `
                                    : ''}
                                {toReadableDatePeriod(fom, tom)}
                            </Timeline.Period>
                        )
                    })}
                </Timeline.Row>
            ))}
        </Timeline>
    )
}

function partitionLanes(sykmeldinger: [SykmeldingFragment, ...SykmeldingFragment[]]): SykmeldingFragment[][] {
    const sorted = R.sortBy(sykmeldinger, [earliestFom, 'asc'])

    const lanes: SykmeldingFragment[][] = []
    const laneEnd: Date[] = []

    for (const sykmelding of sorted) {
        const start = parseISO(earliestFom(sykmelding))
        const end = parseISO(latestTom(sykmelding))

        const laneIndex = laneEnd.findIndex((laneEndDate) => start > laneEndDate)

        if (laneIndex === -1) {
            lanes.push([sykmelding])
            laneEnd.push(end)
        } else {
            lanes[laneIndex].push(sykmelding)
            laneEnd[laneIndex] = end
        }
    }

    return lanes
}
