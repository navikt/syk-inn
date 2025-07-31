'use client'

import React, { ReactElement, useRef, useState } from 'react'
import { Alert, BodyShort, Button, ExpansionCard, Heading, Link as AkselLink, Skeleton } from '@navikt/ds-react'
import { ChevronDownIcon, TabsAddIcon } from '@navikt/aksel-icons'
import Link from 'next/link'
import { useQuery } from '@apollo/client'

import { SykmeldingByIdDocument, SykmeldingFragment } from '@queries'
import { pathWithBasePath } from '@lib/url'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { AssableNextLink } from '@components/links/AssableNextLink'
import { ValueItemSkeleton } from '@components/sykmelding/ValuesSection'
import SykmeldingValues from '@components/sykmelding/SykmeldingValues'
import { cn } from '@lib/tw'

import { DocumentStatusSuccess } from './DocumentStatus'
import { SykmeldingSynchronization } from './SykmeldingSynchronization'

type Props = {
    sykmeldingId: string
}

function SykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    return (
        <div className="p-4 flex flex-row gap-8">
            <div className="max-w-prose w-[65ch]">
                <SykmeldingKvitteringSummary sykmeldingId={sykmeldingId} />
            </div>
            <div className="max-w-prose w-[65ch]">
                <SykmeldingKvitteringStatus sykmeldingId={sykmeldingId} />
            </div>
        </div>
    )
}

function SykmeldingKvitteringSummary({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const dispatch = useAppDispatch()
    const nextDraftId = useRef(crypto.randomUUID())
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, { variables: { id: sykmeldingId } })
    const sykmelding = data?.sykmelding ?? null

    return (
        <>
            <div className="mb-4">
                <Alert variant="success">Nav har mottatt sykmeldingen og sendt den til den sykmeldte</Alert>
            </div>
            <div className="flex justify-between mt-8 mb-4">
                <Button variant="tertiary" size="small" as={AssableNextLink} href="/fhir" className="underline">
                    Tilbake til pasientoversikt
                </Button>

                {loading && data?.sykmelding == null ? (
                    <Skeleton variant="rounded" width={102} height={32} />
                ) : sykmelding ? (
                    <SlowNextLinkButton
                        href={`/fhir/ny/${nextDraftId.current}`}
                        onClick={() => {
                            dispatch(nySykmeldingActions.dupliser(sykmelding))
                        }}
                        icon={<TabsAddIcon aria-hidden />}
                        variant="tertiary"
                        size="small"
                    >
                        Dupliser
                    </SlowNextLinkButton>
                ) : null}
            </div>
            {error && <SykmeldingKvitteringError error={error ?? { message: 'Test' }} refetch={refetch} />}
            {!error && <SykmeldingKvitteringValues loading={loading} sykmelding={sykmelding} />}
            <div className="mt-8">
                {data?.sykmelding ? (
                    <AkselLink href={pathWithBasePath(`/fhir/pdf/${data.sykmelding.sykmeldingId}`)} target="_blank">
                        Se innsendt dokument
                    </AkselLink>
                ) : (
                    <Skeleton width={240} />
                )}
            </div>
        </>
    )
}

type SykmeldingKvitteringValuesProps = {
    sykmelding: SykmeldingFragment | null
    loading: boolean
}

/**
 * Here be dragons. This component hacks around quite a bit with the inner workings of ExpansionCard.
 *
 * Bigger Aksel upgrades should be bumped cautiously, remember to verify it's behaviour after. :-)
 */
function SykmeldingKvitteringValues({ sykmelding, loading }: SykmeldingKvitteringValuesProps): ReactElement {
    const [open, setOpen] = useState(false)

    return (
        <ExpansionCard aria-label="Innsendte opplysninger" size="medium" open={open} className="relative">
            <ExpansionCard.Header
                onClick={() => setOpen((b) => !b)}
                className="bg-surface-subtle border-b-0! rounded-br-none rounded-bl-none"
            >
                <ExpansionCard.Title as="h3" size="medium">
                    Innsendte opplysninger
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content
                className={cn('block overflow-hidden [&>div]:[animation:none]', {
                    'max-h-42': !open,
                })}
            >
                {sykmelding ? (
                    <SykmeldingValues sykmelding={sykmelding} />
                ) : loading ? (
                    <>
                        <ValueItemSkeleton />
                        <ValueItemSkeleton />
                        <ValueItemSkeleton />
                        <ValueItemSkeleton />
                        <ValueItemSkeleton />
                    </>
                ) : null}
                {!open && (
                    <div className="absolute left-1 bottom-1 w-[99%] rounded-b-large">
                        <div className="h-24 bg-gradient-to-b from-transparent to-white" />
                        <div className="bg-white flex items-center justify-center">
                            <Button
                                className="flex flex-col items-center justify-center"
                                variant="tertiary"
                                icon={<ChevronDownIcon aria-hidden className="mr-2 -mt-2" />}
                                iconPosition="right"
                                size="small"
                                onClick={() => setOpen(true)}
                            >
                                Vis mer
                            </Button>
                        </div>
                    </div>
                )}
            </ExpansionCard.Content>
        </ExpansionCard>
    )
}

function SykmeldingKvitteringStatus({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const { loading, data } = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })

    return (
        <div>
            {loading ? (
                <Skeleton variant="rounded" height={62} />
            ) : data?.sykmelding ? (
                data.sykmelding.documentStatus === 'COMPLETE' ? (
                    <DocumentStatusSuccess />
                ) : (
                    <SykmeldingSynchronization sykmeldingId={sykmeldingId} />
                )
            ) : null}

            <Heading level="3" size="small" className="mt-8" spacing>
                Dette gjør Nav videre
            </Heading>
            <BodyShort spacing>
                Når sykmeldingen er sendt, får den som er sykmeldt en SMS fra Nav som bekrefter at vi har mottatt den.
            </BodyShort>
            <BodyShort spacing>
                Deretter kan den sykmeldte logge inn på{' '}
                <Link href="https://www.nav.no/syk/sykefravaer" target="_blank">
                    Ditt Sykefravær
                </Link>{' '}
                for å sende sykmeldingen videre til arbeidsgiveren eller til Nav, hvis det er nødvendig.
            </BodyShort>
        </div>
    )
}

function SykmeldingKvitteringError({ error, refetch }: { error: Error; refetch: () => void }): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="mt-4">
                <Alert variant="error">
                    <Heading size="small" level="3" spacing>
                        Kunne ikke hente sykmeldingen
                    </Heading>
                    <BodyShort spacing>Teknisk feilmelding: {error.message}</BodyShort>
                    <Button variant="secondary-neutral" onClick={() => refetch()} size="small">
                        Prøv å hente på nytt
                    </Button>
                </Alert>
            </div>
        </div>
    )
}

export default SykmeldingKvittering
