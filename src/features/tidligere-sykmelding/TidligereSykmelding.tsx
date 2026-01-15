import React, { PropsWithChildren, ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Skeleton } from '@navikt/ds-react'
import Link from 'next/link'

import { SykmeldingByIdDocument, SykmeldingFragment } from '@queries'
import { toReadableDate } from '@lib/date'
import { ValuesSection } from '@components/sykmelding/ValuesSection'
import SykmeldingValues from '@components/sykmelding/SykmeldingValues'
import BehandlerValues from '@components/sykmelding/BehandlerValues'
import { Utfall } from '@components/sykmelding/Utfall'
import { SimpleAlert } from '@components/help/GeneralErrors'
import TwoPaneGrid from '@components/layout/TwoPaneGrid'
import { cn } from '@lib/tw'
import { useMode } from '@core/providers/Modes'

import { TidligereSykmeldingActions } from './TidligereSykmeldingActions'

export function TidligereSykmelding(): ReactElement {
    const params = useParams<{ sykmeldingId: string }>()
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: params.sykmeldingId },
    })

    if (error) {
        return (
            <TidligereSykmeldingShell>
                <SimpleAlert level="error" title="Kunne ikke hente sykmelding" retry={refetch}>
                    Det oppstod en feil under henting av sykmeldingen. Dette kan være et midlertidig problem.
                </SimpleAlert>
            </TidligereSykmeldingShell>
        )
    }

    if (loading) {
        return (
            <TidligereSykmeldingShell>
                <TidligereSykmeldingTopBar loading />
                <Skeleton variant="rounded" height={400} width="100%" />
                <Skeleton variant="rounded" height={400} width="100%" />
            </TidligereSykmeldingShell>
        )
    }

    if (data?.sykmelding == null) {
        return (
            <TidligereSykmeldingShell>
                <SimpleAlert level="error" title="Sykmelding ikke funnet">
                    Fant ingen sykmelding med denne ID-en.
                </SimpleAlert>
            </TidligereSykmeldingShell>
        )
    }

    return (
        <TidligereSykmeldingShell>
            <TidligereSykmeldingTopBar loading={false} sykmelding={data.sykmelding} />

            <ValuesSection title="Innsendt sykmelding">
                <SykmeldingValues sykmelding={data.sykmelding} />
            </ValuesSection>

            <ValuesSection title="Signerende behandler">
                <BehandlerValues sykmeldingMeta={data.sykmelding.meta} />
            </ValuesSection>
        </TidligereSykmeldingShell>
    )
}

function TidligereSykmeldingShell({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    const mode = useMode()

    return (
        <div className={cn('p-4 bg-ax-bg-default', className)}>
            <TwoPaneGrid tag="div">{children}</TwoPaneGrid>
            <div className="mx-4 flex justify-end p-4 pb-0">
                <Link href={mode.paths.root}>Lukk</Link>
            </div>
        </div>
    )
}

function TidligereSykmeldingTopBar(
    props: { loading: true } | { loading: false; sykmelding: SykmeldingFragment },
): ReactElement {
    return (
        <div className="flex flex-col gap-2 ax-md:gap-0 ax-md:flex-row justify-between items-center ax-lg:col-span-2 h-auto ax-md:h-8 ">
            <div className="flex flex-col ax-sm:flex-row gap-0 ax-sm:gap-10 justify-around ml-4 w-full ax-md:w-auto">
                <div className="flex gap-1">
                    <span>Mottatt:</span>
                    {props.loading ? (
                        <Skeleton className="inline-flex" width={96} />
                    ) : props.sykmelding ? (
                        <span>{toReadableDate(props.sykmelding.meta.mottatt)}</span>
                    ) : null}
                </div>
                <div className="flex gap-1">
                    <span>Status:</span>
                    {props.loading ? (
                        <Skeleton className="inline-flex" width={96} />
                    ) : props.sykmelding ? (
                        <Utfall utfall={props.sykmelding.utfall} size="medium" />
                    ) : null}
                </div>
            </div>
            {!props.loading && props?.sykmelding && <TidligereSykmeldingActions sykmelding={props?.sykmelding} />}
        </div>
    )
}
