import React, { ReactElement } from 'react'
import { Alert, BodyShort, Button, Heading, Skeleton, Table } from '@navikt/ds-react'
import { useMutation, useQuery } from '@apollo/client'
import { TrashIcon } from '@navikt/aksel-icons'

import { cn } from '@utils/tw'
import { DeleteDraftDocument, GetAllDraftsDocument } from '@queries'
import AssableNextLink from '@components/misc/AssableNextLink'

type Props = {
    className?: string
}

function DraftSykmeldingerCard({ className }: Props): ReactElement {
    return (
        <section
            className={cn(className, 'bg-bg-default rounded-sm p-4')}
            aria-labelledby="utkast-sykmeldinger-heading"
        >
            <Heading size="medium" level="2" spacing id="utkast-sykmeldinger-heading">
                Utkast sykmeldinger (ikke sendt til Nav)
            </Heading>
            <DraftList />
        </section>
    )
}

function DraftList(): ReactElement {
    const { data, loading, error, refetch } = useQuery(GetAllDraftsDocument)

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
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Diagnose</Table.HeaderCell>
                        <Table.HeaderCell scope="col" className="max-w-8" />
                        <Table.HeaderCell scope="col" className="max-w-4" />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data?.drafts?.map((draft) => {
                        return (
                            <Table.Row key={draft.draftId}>
                                <Table.DataCell>TODO: Vis dato fra draft</Table.DataCell>
                                <Table.DataCell>TODO: Vis diagnose fra draft</Table.DataCell>
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
            </Table>
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

export default DraftSykmeldingerCard
