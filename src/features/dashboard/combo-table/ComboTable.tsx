import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { BodyShort, Table, Tag, TagProps } from '@navikt/ds-react'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { DraftFragment, SykmeldingFragment, SykmeldingFullFragment, SykmeldingRedactedFragment } from '@queries'
import { byActiveOrFutureSykmelding } from '@data-layer/common/sykmelding-utils'
import { safeParseDraft } from '@data-layer/draft/draft-schema'
import Redaction from '@components/misc/Redaction'

import DashboardTable from '../table/DashboardTable'
import {
    sykmeldingArbeidsgiverText,
    sykmeldingDiagnoseText,
    sykmeldingGradText,
} from '../combo-table/sykmelding/sykmelding-utils'
import { SykmeldingActions } from '../combo-table/sykmelding/SykmeldingActions'
import DraftPeriodeLink from '../combo-table/draft/DraftPeriodeLink'
import SykmeldingPeriodeLink from '../combo-table/sykmelding/SykmeldingPeriodeLink'

import { DraftActions } from './draft/DraftActions'
import { draftAktivitetText, draftArbeidsforholdText, draftDiagnoseText } from './draft/draft-utils'

export function ComboTable({
    sykmeldinger,
    drafts,
    children,
}: PropsWithChildren<{
    sykmeldinger: SykmeldingFragment[]
    drafts: DraftFragment[]
}>): ReactElement {
    const [current, previous] = R.partition<SykmeldingFragment>(sykmeldinger, byActiveOrFutureSykmelding)

    return (
        <DashboardTable>
            <ComboTableHeader />
            <Table.Body>
                {children}
                {drafts.map((draft) => (
                    <DraftTableRow draft={draft} key={draft.draftId} />
                ))}
                {current.map((sykmelding) =>
                    sykmelding.__typename === 'SykmeldingFull' ? (
                        <FullTableRow
                            key={sykmelding.sykmeldingId}
                            sykmelding={sykmelding}
                            status="current"
                            forlengable
                        />
                    ) : (
                        <RedactedTableRow
                            key={sykmelding.sykmeldingId}
                            sykmelding={sykmelding}
                            status="current"
                            forlengable
                        />
                    ),
                )}
                {previous.map((sykmelding) =>
                    sykmelding.__typename === 'SykmeldingFull' ? (
                        <FullTableRow key={sykmelding.sykmeldingId} sykmelding={sykmelding} status="previous" />
                    ) : (
                        <RedactedTableRow key={sykmelding.sykmeldingId} sykmelding={sykmelding} status="previous" />
                    ),
                )}
            </Table.Body>
        </DashboardTable>
    )
}

export function ComboTableHeader({ className }: { className?: string }): ReactElement {
    return (
        <Table.Header className={className}>
            <Table.Row>
                <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                <Table.HeaderCell scope="col">Diagnose</Table.HeaderCell>
                <Table.HeaderCell scope="col">Grad</Table.HeaderCell>
                <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                <Table.HeaderCell scope="col">Utfall</Table.HeaderCell>
                <Table.HeaderCell scope="col" className="w-32 max-w-32">
                    Status
                </Table.HeaderCell>
                {/* Action buttons */}
                <Table.HeaderCell scope="col" className="w-32 max-w-32" />
            </Table.Row>
        </Table.Header>
    )
}

function DraftTableRow({ draft }: { draft: DraftFragment }): ReactElement {
    const values = safeParseDraft(draft.draftId, draft.values)

    return (
        <TableRow
            periode={
                <DraftPeriodeLink draftId={draft.draftId} lastChanged={draft.lastUpdated} perioder={values?.perioder} />
            }
            diagnose={draftDiagnoseText(values?.hoveddiagnose)}
            grad={draftAktivitetText(values?.perioder)}
            arbeidsgiver={draftArbeidsforholdText(values?.arbeidsforhold)}
            utfall={null}
            status="draft"
            actions={<DraftActions draftId={draft.draftId} />}
        />
    )
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
            periode={
                <SykmeldingPeriodeLink sykmeldingId={sykmelding.sykmeldingId} aktivitet={sykmelding.values.aktivitet} />
            }
            diagnose={sykmeldingDiagnoseText(sykmelding.values.hoveddiagnose)}
            grad={sykmeldingGradText(sykmelding.values.aktivitet)}
            arbeidsgiver={sykmeldingArbeidsgiverText(sykmelding.values.arbeidsgiver)}
            utfall={<Utfall utfall={sykmelding.utfall} />}
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
            periode={
                <SykmeldingPeriodeLink sykmeldingId={sykmelding.sykmeldingId} aktivitet={sykmelding.values.aktivitet} />
            }
            diagnose={<Redaction className="w-42" title="Diagnose skjult" />}
            grad={<Redaction className="w-8" title="Sykmeldingsgrad skjult" />}
            arbeidsgiver={<Redaction className="w-2/3" title="Arbeidsgiver skjult" />}
            utfall={<Utfall utfall={sykmelding.utfall} />}
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

function TableRow(props: {
    periode: string | ReactNode
    diagnose: string | ReactNode | null
    grad: string | ReactNode | null
    arbeidsgiver: string | ReactNode | null
    utfall: ReactNode | null
    status: 'draft' | 'previous' | 'current'
    actions: ReactElement | null
}): ReactElement {
    return (
        <Table.Row>
            <Table.DataCell>{props.periode}</Table.DataCell>
            <Table.DataCell>{props.diagnose}</Table.DataCell>
            <Table.DataCell>{props.grad}</Table.DataCell>
            <Table.DataCell>{props.arbeidsgiver}</Table.DataCell>
            <Table.DataCell>{props.utfall}</Table.DataCell>
            <Table.DataCell>
                <StatusTag status={props.status} />
            </Table.DataCell>
            <Table.DataCell>
                <div className="w-full flex justify-end">{props.actions}</div>
            </Table.DataCell>
        </Table.Row>
    )
}

function StatusTag({ status }: { status: 'draft' | 'previous' | 'current' }): ReactElement {
    let text: string, variant: TagProps['variant']
    switch (status) {
        case 'draft':
            text = 'Utkast'
            variant = 'info'
            break
        case 'previous':
            text = 'Tidligere'
            variant = 'neutral'
            break
        case 'current':
            text = 'Pågående'
            variant = 'success'
            break
    }

    return <Tag variant={variant}>{text}</Tag>
}

function Utfall({ utfall }: { utfall: SykmeldingFragment['utfall'] }): React.ReactElement | null {
    if (utfall.result === 'OK') {
        return <BodyShort size="small">Godkjent</BodyShort>
    } else if (utfall.result === 'PENDING') {
        return <BodyShort size="small">Til behandling</BodyShort>
    } else if (utfall.result === 'INVALID') {
        return <BodyShort size="small">Avvist</BodyShort>
    }

    logger.error(`Unknown utfall for sykmelding: ${utfall.result}`)

    return null
}
