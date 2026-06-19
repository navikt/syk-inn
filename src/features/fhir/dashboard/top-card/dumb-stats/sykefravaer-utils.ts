import { differenceInDays } from 'date-fns'
import * as R from 'remeda'

import { earliestFom, latestTom } from '#data-layer/common/sykmelding-utils'
import { SykmeldingFragment } from '#queries'

export function continiousSykefravaer(sykmeldinger: SykmeldingFragment[]): number {
    if (sykmeldinger.length === 0) {
        return 0
    }

    const ranges = R.pipe(
        sykmeldinger,
        R.map((it) => [earliestFom(it), latestTom(it)] as const),
        R.sortBy([(it) => it[0], 'asc']),
    )

    let startdato = ranges[0][0]
    let previous = startdato
    for (const [fom, tom] of ranges) {
        const diff = differenceInDays(fom, previous)

        if (diff > 16) startdato = fom
        previous = tom
    }

    const lastTom = R.last(ranges)?.[1]
    const diffFromStartdatoToLastTom = lastTom ? differenceInDays(lastTom, startdato) + 1 : 0

    return diffFromStartdatoToLastTom
}
