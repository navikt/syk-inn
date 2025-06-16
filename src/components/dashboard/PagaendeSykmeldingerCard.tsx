import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { Alert, BodyShort, Button, Skeleton, Table } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'
import { formatDistanceToNow } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { AllSykmeldingerDocument, SykmeldingFragment } from '@queries'
import { raise } from '@utils/ts'
import AssableNextLink from '@components/misc/AssableNextLink'
import { toReadableDatePeriod } from '@utils/date'
import DashboardTable from '@components/dashboard/table/DashboardTable'
import DashboardCard from '@components/dashboard/card/DashboardCard'

import { byActiveOrFutureSykmelding } from '../../data-layer/common/sykmelding-utils'

function PagaendeSykmeldingerCard(): ReactElement {
    const { loading, data, error, refetch } = useQuery(AllSykmeldingerDocument, {
        nextFetchPolicy: 'cache-and-network',
    })

    const currentSykmeldinger = data?.sykmeldinger?.filter(byActiveOrFutureSykmelding) ?? []

    return (
        <DashboardCard
            id="pagaende-sykmeldinger-card"
            title={
                loading ? (
                    <span>
                        Pågående sykmeldinger (
                        <Skeleton className="inline-block" width="16px" />)
                    </span>
                ) : (
                    <span className="inline-flex gap-3 items-center">
                        <span>Pågående sykmeldinger ({currentSykmeldinger.length})</span>
                        {currentSykmeldinger.length > 0 && (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        )}
                    </span>
                )
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
                    <Table.HeaderCell scope="col">Mottatt</Table.HeaderCell>
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

export default PagaendeSykmeldingerCard
