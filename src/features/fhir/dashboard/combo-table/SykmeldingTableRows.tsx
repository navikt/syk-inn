import React, { ReactElement } from 'react'

import Redaction from '#components/misc/Redaction'
import { isTodayOrInTheFuture, isWithinWeeksOldSykmelding } from '#data-layer/common/sykmelding-utils'
import {
    SykmeldingFragment,
    SykmeldingFullFragment,
    SykmeldingLightFragment,
    SykmeldingRedactedFragment,
} from '#queries'

import { TableRow } from './ComboTableRows'
import { sykmeldingArbeidsgiverText, sykmeldingDiagnoseText, sykmeldingGradText } from './sykmelding/sykmelding-utils'
import { SykmeldingActions } from './sykmelding/SykmeldingActions'
import SykmeldingPeriodeLink from './sykmelding/SykmeldingPeriodeLink'

export function SykmeldingTableRow({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const status = isTodayOrInTheFuture(sykmelding) ? 'current' : 'previous'
    const forlengable = isWithinWeeksOldSykmelding(sykmelding, 4) ? true : undefined

    switch (sykmelding.__typename) {
        case 'SykmeldingFull':
            return (
                <FullTableRow
                    key={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    status={status}
                    forlengable={forlengable}
                />
            )
        case 'SykmeldingLight':
            return (
                <LightTableRow
                    key={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    status={status}
                    forlengable={forlengable}
                />
            )
        case 'SykmeldingRedacted':
            return (
                <RedactedTableRow
                    key={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    status={status}
                    forlengable={forlengable}
                />
            )
    }
}

function FullTableRow({
    sykmelding,
    status,
    forlengable,
}: {
    sykmelding: SykmeldingFullFragment
    status: 'draft' | 'previous' | 'current'
    forlengable?: true
}): ReactElement {
    return (
        <TableRow
            perioder={
                <SykmeldingPeriodeLink sykmeldingId={sykmelding.sykmeldingId} aktivitet={sykmelding.values.aktivitet} />
            }
            diagnose={sykmeldingDiagnoseText(sykmelding.values.hoveddiagnose)}
            grad={sykmeldingGradText(sykmelding.values.aktivitet)}
            arbeidsgiver={sykmeldingArbeidsgiverText(sykmelding.values.arbeidsgiver)}
            status={status}
            actions={
                <SykmeldingActions
                    sykmeldingId={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    forlengable={forlengable}
                />
            }
        />
    )
}

function LightTableRow({
    sykmelding,
    status,
    forlengable,
}: {
    sykmelding: SykmeldingLightFragment
    status: 'draft' | 'previous' | 'current'
    forlengable?: true
}): ReactElement {
    return (
        <TableRow
            perioder={
                <SykmeldingPeriodeLink sykmeldingId={sykmelding.sykmeldingId} aktivitet={sykmelding.values.aktivitet} />
            }
            diagnose={sykmeldingDiagnoseText(sykmelding.values.hoveddiagnose)}
            grad={sykmeldingGradText(sykmelding.values.aktivitet)}
            arbeidsgiver={null}
            status={status}
            actions={
                <SykmeldingActions
                    sykmeldingId={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    forlengable={forlengable}
                />
            }
        />
    )
}

function RedactedTableRow({
    sykmelding,
    status,
    forlengable,
}: {
    sykmelding: SykmeldingRedactedFragment
    status: 'draft' | 'previous' | 'current'
    forlengable?: true
}): ReactElement {
    return (
        <TableRow
            perioder={
                <SykmeldingPeriodeLink sykmeldingId={sykmelding.sykmeldingId} aktivitet={sykmelding.values.aktivitet} />
            }
            diagnose={<Redaction className="w-42" title="Diagnose skjult" />}
            grad={<Redaction className="w-8" title="Sykmeldingsgrad skjult" />}
            arbeidsgiver={<Redaction className="w-2/3" title="Arbeidsgiver skjult" />}
            status={status}
            actions={
                <SykmeldingActions
                    sykmeldingId={sykmelding.sykmeldingId}
                    sykmelding={sykmelding}
                    forlengable={forlengable}
                />
            }
        />
    )
}
