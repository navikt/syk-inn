import React, { ReactElement, ReactNode } from 'react'
import { BodyShort, Table, Tag, TagProps } from '@navikt/ds-react'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { DraftFragment, SykmeldingFragment } from '@queries'
import {
    draftAktivitetText,
    draftArbeidsforholdText,
    draftDiagnoseText,
} from '@components/dashboard/combo-table/draft/draft-utils'
import { DraftActions } from '@components/dashboard/combo-table/draft/DraftActions'
import SykmeldingPeriodeLink from '@components/dashboard/combo-table/sykmelding/SykmeldingPeriodeLink'
import {
    sykmeldingDiagnoseText,
    sykmeldingGradText,
} from '@components/dashboard/combo-table/sykmelding/sykmelding-utils'
import { SykmeldingActions } from '@components/dashboard/combo-table/sykmelding/SykmeldingActions'
import DraftPeriodeLink from '@components/dashboard/combo-table/draft/DraftPeriodeLink'

import { byActiveOrFutureSykmelding } from '../../../data-layer/common/sykmelding-utils'
import { safeParseDraft } from '../../../data-layer/draft/draft-schema'

export function ComboTable({
    sykmeldinger,
    drafts,
}: {
    sykmeldinger: SykmeldingFragment[]
    drafts: DraftFragment[]
}): ReactElement {
    const [current, previous] = R.partition<SykmeldingFragment>(sykmeldinger, byActiveOrFutureSykmelding)

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Diagnose</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Grad</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Utstedt av</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Utfall</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                    {/* Action buttons */}
                    <Table.HeaderCell scope="col" />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {drafts.map((draft) => {
                    const values = safeParseDraft(draft.draftId, draft.values)

                    return (
                        <TableRow
                            key={draft.draftId}
                            periode={
                                <DraftPeriodeLink
                                    draftId={draft.draftId}
                                    lastChanged={draft.lastUpdated}
                                    perioder={values?.perioder}
                                />
                            }
                            diagnose={draftDiagnoseText(values?.hoveddiagnose)}
                            grad={draftAktivitetText(values?.perioder)}
                            arbeidsgiver={draftArbeidsforholdText(values?.arbeidsforhold)}
                            utfall={null}
                            utstedtAv={null}
                            status="draft"
                            actions={<DraftActions draftId={draft.draftId} />}
                        ></TableRow>
                    )
                })}
                {current.map((sykmelding) => {
                    return (
                        <TableRow
                            key={sykmelding.sykmeldingId}
                            periode={
                                <SykmeldingPeriodeLink
                                    sykmeldingId={sykmelding.sykmeldingId}
                                    aktivitet={sykmelding.values.aktivitet}
                                />
                            }
                            diagnose={sykmeldingDiagnoseText(sykmelding.values.hoveddiagnose)}
                            grad={sykmeldingGradText(sykmelding.values.aktivitet)}
                            // TODO: Expand Sykmelding GQL with values
                            arbeidsgiver={null}
                            utfall={<Utfall utfall={sykmelding.utfall} />}
                            // TODO: Expand Sykmelding GQL with values
                            utstedtAv={null}
                            status="current"
                            actions={<SykmeldingActions sykmeldingId={sykmelding.sykmeldingId} forlengable />}
                        />
                    )
                })}
                {previous.map((sykmelding) => {
                    return (
                        <TableRow
                            key={sykmelding.sykmeldingId}
                            periode={
                                <SykmeldingPeriodeLink
                                    sykmeldingId={sykmelding.sykmeldingId}
                                    aktivitet={sykmelding.values.aktivitet}
                                />
                            }
                            diagnose={sykmeldingDiagnoseText(sykmelding.values.hoveddiagnose)}
                            grad={sykmeldingGradText(sykmelding.values.aktivitet)}
                            // TODO: Expand Sykmelding GQL with values
                            arbeidsgiver={null}
                            utfall={<Utfall utfall={sykmelding.utfall} />}
                            // TODO: Expand Sykmelding GQL with values
                            utstedtAv={null}
                            status="previous"
                            actions={<SykmeldingActions sykmeldingId={sykmelding.sykmeldingId} />}
                        />
                    )
                })}
            </Table.Body>
        </Table>
    )
}

function TableRow(props: {
    periode: string | ReactNode
    diagnose: string
    grad: string | null
    arbeidsgiver: string | null
    utstedtAv: string | null
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
            <Table.DataCell>{props.utstedtAv}</Table.DataCell>
            <Table.DataCell>{props.utfall}</Table.DataCell>
            <Table.DataCell className="max-w-12">
                <StatusTag status={props.status} />
            </Table.DataCell>
            <Table.DataCell align="left" className="max-w-22">
                {props.actions}
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
    } else if (utfall.result === 'MANUAL_PROCESSING') {
        return <BodyShort size="small">Til behandling</BodyShort>
    } else if (utfall.result === 'INVALID') {
        return <BodyShort size="small">Avvist</BodyShort>
    }

    logger.error(`Unknown utfall for sykmelding: ${utfall.result}`)

    return null
}
