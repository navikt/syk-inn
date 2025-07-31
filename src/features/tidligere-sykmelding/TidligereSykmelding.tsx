import React, { ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { Alert, BodyShort, Button, Heading, Skeleton } from '@navikt/ds-react'

import { SykmeldingByIdDocument } from '@queries'
import { toReadableDate } from '@lib/date'
import { ValuesSection } from '@components/sykmelding/ValuesSection'
import SykmeldingValues from '@components/sykmelding/SykmeldingValues'
import BehandlerValues from '@components/sykmelding/BehandlerValues'

export function TidligereSykmelding(): ReactElement {
    const params = useParams<{ sykmeldingId: string }>()
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: params.sykmeldingId },
    })

    if (error) {
        return (
            <div className="p-4">
                <TidligereSykmeldingError refetch={() => refetch()} />
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="pb-4 ml-4 flex flex-row gap-2">
                    <span>Mottatt:</span>
                    <Skeleton className="inline-flex" width={96} />
                </div>
                <div className="flex flex-row gap-8">
                    <div className="max-w-prose w-[65ch]">
                        <Skeleton variant="rounded" height={400} width="100%" />
                    </div>
                    <div className="max-w-prose w-[65ch]">
                        <Skeleton variant="rounded" height={400} width="100%" />
                    </div>
                </div>
            </div>
        )
    }

    if (data?.sykmelding == null) {
        return (
            <div className="p-4 max-w-prose w-[65ch]">
                <Alert variant="error">
                    <Heading size="small" level="3" spacing>
                        Sykmelding ikke funnet
                    </Heading>
                    <BodyShort spacing>Fant ingen sykmelding med denne ID-en.</BodyShort>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="pb-4 ml-4 flex flex-row gap-2">
                <span>Mottatt:</span>
                {loading ? (
                    <Skeleton className="inline-flex" width={96} />
                ) : data?.sykmelding ? (
                    <span>{toReadableDate(data.sykmelding.meta.mottatt)}</span>
                ) : null}
            </div>
            <div className="flex flex-row gap-8">
                <div className="max-w-prose w-[65ch]">
                    <ValuesSection title="Innsendt sykmelding">
                        <SykmeldingValues sykmelding={data.sykmelding} />
                    </ValuesSection>
                </div>
                <div className="max-w-prose w-[65ch]">
                    <ValuesSection title="Signerende behandler">
                        <BehandlerValues sykmeldingMeta={data.sykmelding.meta} />
                    </ValuesSection>
                </div>
            </div>
        </div>
    )
}

function TidligereSykmeldingError({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <Alert variant="error">
            <Heading size="small" level="3" spacing>
                Kunne ikke hente sykmelding
            </Heading>
            <BodyShort spacing>Det oppstod en feil under henting av sykmeldingen.</BodyShort>
            <Button size="small" variant="secondary-neutral" onClick={() => refetch()}>
                Prøv på nytt
            </Button>
        </Alert>
    )
}
