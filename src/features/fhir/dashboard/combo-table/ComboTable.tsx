import { Table } from '@navikt/ds-react'
import React, { PropsWithChildren, ReactElement } from 'react'
import * as R from 'remeda'

import { latestTom } from '#data-layer/common/sykmelding-utils'
import { safeParseDraft } from '#data-layer/draft/draft-schema'
import { DraftFragment, SykmeldingFragment } from '#queries'

import { DashboardTable } from '../table/DashboardTable'

import { TableRow } from './ComboTableRows'
import { draftAktivitetText, draftArbeidsforholdText, draftDiagnoseText } from './draft/draft-utils'
import { DraftActions } from './draft/DraftActions'
import { DraftPeriodeLink } from './draft/DraftPeriodeLink'
import { SykmeldingTableRow } from './SykmeldingTableRows'

export function ComboTable({
    sykmeldinger,
    drafts,
    children,
}: PropsWithChildren<{
    sykmeldinger: SykmeldingFragment[] | null
    drafts: DraftFragment[] | null
}>): ReactElement {
    return (
        <DashboardTable>
            <ComboTableHeader />
            <Table.Body>
                {children}
                {(drafts ?? []).map((draft) => (
                    <DraftTableRow draft={draft} key={draft.draftId} />
                ))}
                {R.sortBy(sykmeldinger ?? [], [latestTom, 'desc']).map((sykmelding) => (
                    <SykmeldingTableRow sykmelding={sykmelding} key={sykmelding.sykmeldingId} />
                ))}
            </Table.Body>
        </DashboardTable>
    )
}

export function ComboTableHeader({ className }: { className?: string }): ReactElement {
    return (
        <Table.Header className={className}>
            <Table.Row>
                <Table.HeaderCell scope="col" className="min-w-38">
                    Periode(r)
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" className="min-w-46">
                    Diagnose
                </Table.HeaderCell>
                <Table.HeaderCell scope="col">Grad</Table.HeaderCell>
                <Table.HeaderCell scope="col">Arbeidsgiver</Table.HeaderCell>
                <Table.HeaderCell scope="col" className="w-32 max-w-32" />
                {/* Action buttons */}
                <Table.HeaderCell scope="col" className="w-44 max-w-44" />
            </Table.Row>
        </Table.Header>
    )
}

function DraftTableRow({ draft }: { draft: DraftFragment }): ReactElement {
    const values = safeParseDraft(draft.draftId, draft.values)

    return (
        <TableRow
            perioder={
                <DraftPeriodeLink draftId={draft.draftId} lastChanged={draft.lastUpdated} perioder={values?.perioder} />
            }
            diagnose={draftDiagnoseText(values?.hoveddiagnose)}
            grad={draftAktivitetText(values?.perioder)}
            arbeidsgiver={draftArbeidsforholdText(values?.arbeidsforhold)}
            status="draft"
            actions={<DraftActions draftId={draft.draftId} />}
        />
    )
}
