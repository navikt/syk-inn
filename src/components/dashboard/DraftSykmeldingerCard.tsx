import React, { ReactElement, useState } from 'react'
import { Alert, BodyShort, Button, Heading, Skeleton, Table } from '@navikt/ds-react'
import { useMutation, useQuery } from '@apollo/client'
import { TrashIcon } from '@navikt/aksel-icons'
import { differenceInSeconds, formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import AssableNextLink from '@components/misc/AssableNextLink'
import useInterval from '@utils/hooks/useInterval'
import { toReadableDate, toReadableDatePeriod } from '@utils/date'
import DashboardTable from '@components/dashboard/table/DashboardTable'
import DashboardCard from '@components/dashboard/card/DashboardCard'

import { safeParseDraft } from '../../data-layer/draft/draft-schema'

type Props = {
    className?: string
}

function DraftSykmeldingerCard({ className }: Props): ReactElement {
    return (
        <DashboardCard title="Utkast sykmeldinger (ikke sendt til Nav)" className={className}>
            <DraftList />
        </DashboardCard>
    )
}

function DraftList(): ReactElement {
    const { data, loading, error, refetch } = useQuery(GetAllDraftsDocument, {
        fetchPolicy: 'cache-and-network',
    })

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <Skeleton width="100" height={48} variant="rounded" />
                <Skeleton width="100" height={48} variant="rounded" />
                <Skeleton width="100" height={48} variant="rounded" />
                <Skeleton width="100" height={48} variant="rounded" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-8">
                <Alert variant="error" className="max-w-prose">
                    <Heading size="small" level="3" spacing>
                        Kunne ikke hente utkast
                    </Heading>
                    <BodyShort spacing>
                        Dette skal være et midlertidig problem. Dersom det vedvarer, vennligst kontakt.
                    </BodyShort>
                    <Button size="small" variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv på nytt
                    </Button>
                </Alert>
            </div>
        )
    }

    if (!data?.drafts || data.drafts.length === 0) {
        return (
            <div className="mt-4">
                <Heading size="small" level="3" spacing>
                    Ingen utkast funnet
                </Heading>
                <BodyShort spacing>Du har for øyeblikket ingen sykmelding utkast for denne pasienten.</BodyShort>
                <BodyShort className="italic">Utkast blir slettet hver dag 00:00</BodyShort>
            </div>
        )
    }

    return (
        <div>
            <DashboardTable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Diagnose</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Sist endret</Table.HeaderCell>
                        <Table.HeaderCell scope="col" className="max-w-8" />
                        <Table.HeaderCell scope="col" className="max-w-4" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.drafts.map((draft) => {
                        const values = safeParseDraft(draft.draftId, draft.values)

                        return (
                            <Table.Row key={draft.draftId}>
                                <Table.DataCell>
                                    <PeriodText perioder={values?.perioder} />
                                </Table.DataCell>
                                <Table.DataCell>
                                    {values?.hoveddiagnose != null
                                        ? `${values.hoveddiagnose.code} - ${values.hoveddiagnose.text}`
                                        : 'Ingen diagnose'}
                                </Table.DataCell>
                                <Table.DataCell>
                                    <AutoUpdatingDistance time={draft.lastUpdated} />
                                </Table.DataCell>
                                <Table.DataCell className="max-w-8" align="center">
                                    <Button
                                        variant="tertiary"
                                        size="small"
                                        as={AssableNextLink}
                                        href={`/fhir/ny/${draft.draftId}`}
                                    >
                                        Åpne
                                    </Button>
                                </Table.DataCell>
                                <Table.DataCell className="max-w-4" align="center">
                                    <DeleteDraftRowButton draftId={draft.draftId} />
                                </Table.DataCell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </DashboardTable>
        </div>
    )
}

function DeleteDraftRowButton({ draftId }: { draftId: string }): ReactElement {
    const [deleteDraft, deleteDraftResult] = useMutation(DeleteDraftDocument, {
        refetchQueries: [GetAllDraftsDocument],
        awaitRefetchQueries: true,
    })

    return (
        <Button
            icon={<TrashIcon title="Slett utkast" />}
            size="small"
            variant="tertiary-neutral"
            loading={deleteDraftResult.loading}
            onClick={() =>
                deleteDraft({
                    variables: { draftId },
                })
            }
        />
    )
}

function AutoUpdatingDistance({ time }: { time: string }): ReactElement {
    const [rerernderino, triggerino] = useState(0)
    const diffInSeconds = differenceInSeconds(new Date(), time)

    /**
     * More than 5 minutes: 1 minute rerender
     * More than 1 minute: 10 seconds rerender
     * Less than 1 minute: 5 second rerender
     */
    const rerenderIntervalMs = diffInSeconds > 300 ? 1000 * 60 : diffInSeconds > 60 ? 1000 * 10 : 5000

    useInterval(() => {
        triggerino((prev) => prev + 1)
    }, rerenderIntervalMs)

    return (
        <React.Fragment key={rerernderino}>{formatDistanceToNow(time, { locale: nb, addSuffix: true })}</React.Fragment>
    )
}

function PeriodText({
    perioder,
}: {
    perioder: { fom: string | null; tom: string | null }[] | null | undefined
}): ReactElement {
    if (!perioder || perioder.length === 0) {
        return <span>Ingen periode</span>
    }

    const firstPeriodFom = perioder[0].fom
    const lastPeriodTom = perioder[perioder.length - 1].tom
    const fomDate = firstPeriodFom ? parseISO(firstPeriodFom) : null
    const tomDate = lastPeriodTom ? parseISO(lastPeriodTom) : null

    // We have no periods, or both are invalid dates
    if ((!fomDate && !tomDate) || (!isValid(fomDate) && !isValid(tomDate))) {
        return <span>Ingen periode</span>
    }

    // We have both periods
    if (fomDate && tomDate && isValid(fomDate) && isValid(tomDate)) {
        return <span>{toReadableDatePeriod(fomDate, tomDate)}</span>
    }

    // Only fom
    if (fomDate && isValid(fomDate)) {
        return <span>Fra {toReadableDate(fomDate)}</span>
    }

    // Only tom
    if (tomDate && isValid(tomDate)) {
        return <span>Til {toReadableDate(tomDate)}</span>
    }

    // Can't happen (probably)
    return <span>Ingen periode</span>
}

export default DraftSykmeldingerCard
