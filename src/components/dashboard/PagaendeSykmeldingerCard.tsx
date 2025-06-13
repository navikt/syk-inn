import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { Alert, BodyShort, Button, Skeleton, Table } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'
import { formatDistanceToNow, isAfter } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { AllSykmeldingerDocument, SykmeldingFragment } from '@queries'
import { raise } from '@utils/ts'
import AssableNextLink from '@components/misc/AssableNextLink'
import { toReadableDatePeriod } from '@utils/date'
import DashboardTable from '@components/dashboard/table/DashboardTable'
import DashboardCard from '@components/dashboard/card/DashboardCard'

function PagaendeSykmeldingerCard(): ReactElement {
    const { loading, data, error, refetch } = useQuery(AllSykmeldingerDocument, {
        nextFetchPolicy: 'cache-and-network',
    })

    const currentSykmeldinger = data?.sykmeldinger?.filter(byCurrentSykmelding) ?? []

    return (
        <DashboardCard
            id="pagaende-sykmeldinger-card"
            title={
                <span>
                    Pågående sykmeldinger (
                    {loading ? (
                        <Skeleton className="inline-block" width="16px" />
                    ) : (
                        <span>{currentSykmeldinger.length}</span>
                    )}
                    )
                </span>
            }
        >
            {!loading && !error && (
                <>
                    {currentSykmeldinger.length > 0 ? (
                        <CurrentSykmeldingerTable sykmeldinger={currentSykmeldinger} />
                    ) : (
                        <BodyShort>Det er ingen aktive sykmeldinger i denne perioden.</BodyShort>
                    )}
                </>
            )}
            {error && (
                <Alert variant="error">
                    <BodyShort spacing>Kunne ikke hente pågående sykmeldinger</BodyShort>
                    <Button size="xsmall" variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv på nytt
                    </Button>
                </Alert>
            )}
        </DashboardCard>
    )
}

function CurrentSykmeldingerTable({ sykmeldinger }: { sykmeldinger: SykmeldingFragment[] }): ReactElement {
    return (
        <DashboardTable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Diagnose</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Sist endret</Table.HeaderCell>
                    <Table.HeaderCell scope="col" />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {sykmeldinger.map((sykmelding) => (
                    <Table.Row key={sykmelding.sykmeldingId}>
                        <Table.DataCell>
                            <PeriodText perioder={sykmelding.values.aktivitet} />
                        </Table.DataCell>
                        <Table.DataCell>
                            {sykmelding.values.hoveddiagnose != null
                                ? `${sykmelding.values.hoveddiagnose.code} - ${sykmelding.values.hoveddiagnose.text}`
                                : 'Ingen diagnose'}
                        </Table.DataCell>
                        <Table.DataCell>
                            {formatDistanceToNow(sykmelding.meta.mottatt, { locale: nb, addSuffix: true })}
                        </Table.DataCell>
                        <Table.DataCell align="center">
                            <Button
                                variant="tertiary"
                                size="small"
                                as={AssableNextLink}
                                href={`/fhir/sykmelding/${sykmelding.sykmeldingId}`}
                            >
                                Åpne
                            </Button>
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </DashboardTable>
    )
}

function PeriodText({ perioder }: { perioder: { fom: string; tom: string }[] }): ReactElement {
    const earliestPeriode = R.firstBy(perioder, [(it) => it.fom, 'desc'])
    const latestPeriode = R.firstBy(perioder, [(it) => it.fom, 'desc'])

    if (!earliestPeriode || !latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    return <span>{toReadableDatePeriod(earliestPeriode.fom, latestPeriode.tom)}</span>
}

function byCurrentSykmelding(sykmelding: SykmeldingFragment): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    return isAfter(new Date(), latestPeriode.tom)
}

export default PagaendeSykmeldingerCard
