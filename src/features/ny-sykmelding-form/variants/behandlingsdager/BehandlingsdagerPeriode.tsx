import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'
import { format, isSameDay } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import PeriodePicker from '@features/ny-sykmelding-form/sections/aktivitet/PeriodePicker'
import { toReadablePeriodLength } from '@lib/date'
import { getNumberOfBehandlingsdager } from '@data-layer/common/behandlingsdager'

type Props = {
    initialFom: string | null
}

function BehandlingsdagerPeriode({ initialFom }: Props): ReactElement {
    return (
        <div>
            <BodyShort spacing>
                Gjelder kun enkeltdager med behandling som foregår over tid. Ved sammenhengende sykefravær over flere
                dager kreves ordinær sykmelding.
            </BodyShort>
            <PeriodePicker
                index={0}
                isLast={false}
                initialFom={initialFom}
                formatRangeDescription={behandlingsdagerDescription}
            />
        </div>
    )
}

export function behandlingsdagerDescription(fom: Date | string, tom: Date | string): { main: string; detail: string } {
    const antallBehandlingsdager = getNumberOfBehandlingsdager(fom, tom)

    const isFomToday = isSameDay(fom, new Date())
    const isTomToday = isSameDay(tom, new Date())

    const behandlingsdagerText = `behandlingsdag${antallBehandlingsdager > 1 ? 'er' : ''}`
    const ukerText = `uke${antallBehandlingsdager > 1 ? 'r' : ''}`

    return {
        main: `${antallBehandlingsdager} ${behandlingsdagerText} over ${toReadablePeriodLength(fom, tom)} (${antallBehandlingsdager} ${ukerText})`,
        detail: `Fra ${format(fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`,
    }
}

export default BehandlingsdagerPeriode
