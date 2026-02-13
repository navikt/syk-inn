'use client'

import React, { ReactElement, useEffect, useState } from 'react'
import { BodyShort, Button, ExpansionCard, Heading, Link as AkselLink, Skeleton, InfoCard } from '@navikt/ds-react'
import { CheckmarkCircleFillIcon, ChevronDownIcon, ExclamationmarkTriangleIcon, TabsAddIcon } from '@navikt/aksel-icons'
import { useQuery } from '@apollo/client/react'

import { SykmeldingByIdDocument, SykmeldingFragment } from '@queries'
import { pathWithBasePath } from '@lib/url'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { ValueItemSkeleton } from '@components/sykmelding/ValuesSection'
import SykmeldingValues from '@components/sykmelding/SykmeldingValues'
import { cn } from '@lib/tw'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { useAppDispatch } from '@core/redux/hooks'
import { useMode } from '@core/providers/Modes'
import TwoPaneGrid from '@components/layout/TwoPaneGrid'
import { SimpleAlert } from '@components/help/GeneralErrors'
import { ShortcutButtonLink } from '@components/shortcut/ShortcutButtons'
import { useFlag } from '@core/toggles/context'
import FeedbackInSitu from '@components/feedback/v2/in-situ/FeedbackInSitu'

import { DocumentStatusSuccess } from './DocumentStatus'
import { SykmeldingSynchronization } from './SykmeldingSynchronization'
import { DownloadPdfButton } from './DownloadPdf'

type Props = {
    sykmeldingId: string
}

function SykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    const kvitteringFeedback = useFlag('SYK_INN_FEEDBACK_KVITTERING')
    const dispatch = useAppDispatch()
    const mode = useMode()

    useEffect(() => {
        /**
         * Once the kvittering is displayed, we are done with the redux state. It is also cleared when returning
         * to the dashboard, but user might dupliser the sykmelding from other actions.
         */
        dispatch(nySykmeldingActions.reset())
    }, [dispatch])

    return (
        <div className="p-4">
            <TwoPaneGrid tag="div">
                <div className="">
                    <SykmeldingKvitteringSummary sykmeldingId={sykmeldingId} />
                    <div className="flex justify-end mt-4">
                        {mode.type === 'FHIR' ? (
                            <ShortcutButtonLink
                                variant="primary"
                                size="small"
                                href={mode.paths.root}
                                className="underline"
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'ArrowLeft',
                                }}
                            >
                                Tilbake til pasientoversikt
                            </ShortcutButtonLink>
                        ) : (
                            <ShortcutButtonLink
                                variant="primary"
                                size="small"
                                href={mode.paths.root}
                                className="underline"
                                shortcut={{
                                    modifier: 'alt',
                                    code: 'ArrowLeft',
                                }}
                            >
                                Tilbake til pasientsøk
                            </ShortcutButtonLink>
                        )}
                    </div>
                </div>
                <div>
                    <SykmeldingKvitteringStatus sykmeldingId={sykmeldingId} />
                    {kvitteringFeedback && <FeedbackInSitu />}
                </div>
            </TwoPaneGrid>
        </div>
    )
}

function SykmeldingKvitteringSummary({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const mode = useMode()
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, { variables: { id: sykmeldingId } })
    const sykmelding = data?.sykmelding ?? null

    if (!loading && sykmelding == null) {
        return (
            <SimpleAlert level="warning" title="Fant ikke sykmeldingen" retry={refetch}>
                Av ukjente årsaker klarte vi ikke å hente sykmeldingen akkurat nå.
            </SimpleAlert>
        )
    }

    return (
        <>
            <div className="mb-4">
                {loading && sykmelding == null ? (
                    <Skeleton variant="rounded" height={48} />
                ) : (
                    <InfoCard data-color="success" size="small">
                        <InfoCard.Header icon={<CheckmarkCircleFillIcon aria-hidden />}>
                            <InfoCard.Title>Nav har mottatt sykmeldingen og sendt den til den sykmeldte</InfoCard.Title>
                        </InfoCard.Header>
                    </InfoCard>
                )}
                <InfoCard data-color="warning" size="small" className="mt-2">
                    <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                        <InfoCard.Title>Husk at L-takster må legges inn manuelt</InfoCard.Title>
                    </InfoCard.Header>
                </InfoCard>
            </div>
            <div className="flex justify-between mt-4 mb-4">
                {sykmelding ? (
                    <>
                        <AkselLink href={pathWithBasePath(mode.paths.pdf(sykmelding.sykmeldingId))} target="_blank">
                            Se innsendt dokument
                        </AkselLink>
                        <AkselLink
                            href={pathWithBasePath(mode.paths.pdf(sykmelding.sykmeldingId)) + '?gotenberg=true'}
                            target="_blank"
                        >
                            Se innsendt dokument (ny)
                        </AkselLink>
                    </>
                ) : (
                    <Skeleton width={240} />
                )}
                {loading && sykmelding == null ? (
                    <Skeleton variant="rounded" width={102} height={32} />
                ) : sykmelding ? (
                    <SlowNextLinkButton
                        href={mode.paths.dupliser(sykmelding.sykmeldingId)}
                        icon={<TabsAddIcon aria-hidden />}
                        variant="tertiary"
                        size="small"
                    >
                        Dupliser
                    </SlowNextLinkButton>
                ) : null}
            </div>
            {error && <SykmeldingKvitteringError error={error ?? { message: 'Ukjent feil' }} refetch={refetch} />}
            {!error && <SykmeldingKvitteringValues loading={loading} sykmelding={sykmelding} />}
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
            <ExpansionCard.Header onClick={() => setOpen((b) => !b)} className="bg-ax-bg-neutral-soft rounded-b-none">
                <ExpansionCard.Title as="h3" size="medium">
                    Innsendte opplysninger
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content
                className={cn('block visible pt-4 [&>div]:opacity-100', {
                    'max-h-48': !open,
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
                    <>
                        <div className="absolute left-1 bottom-1 w-[99%] rounded-b-lg">
                            <div className="h-24 bg-linear-to-b from-transparent to-ax-bg-default" />
                            <div className="bg-ax-bg-default flex items-center justify-center">
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
                        <div
                            className="absolute left-2 bottom-0 w-[97%] h-2 bg-ax-bg-default"
                            style={{ borderBottom: '1px solid var(--ax-border-neutral)' }}
                        />
                    </>
                )}
            </ExpansionCard.Content>
        </ExpansionCard>
    )
}

function SykmeldingKvitteringStatus({ sykmeldingId }: { sykmeldingId: string }): ReactElement | null {
    const mode = useMode()
    const { loading, data } = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })

    if (data?.sykmelding?.__typename === 'SykmeldingRedacted') {
        throw new Error('Tried displaying kvittering, but got SykmeldingRedacted, that should not happen')
    }

    if (!loading && data?.sykmelding == null) {
        // Sibling component displays not found warning
        return null
    }

    return (
        <div>
            {mode.type === 'FHIR' && (
                <>
                    {loading ? (
                        <Skeleton variant="rounded" height={48} />
                    ) : data?.sykmelding ? (
                        data.sykmelding.documentStatus === 'COMPLETE' ? (
                            <DocumentStatusSuccess />
                        ) : (
                            <SykmeldingSynchronization sykmeldingId={sykmeldingId} />
                        )
                    ) : null}
                </>
            )}
            {mode.type === 'HelseID' && <DownloadPdfButton sykmeldingId={sykmeldingId} />}
            <Heading level="3" size="small" className="mt-8" spacing>
                Dette gjør Nav videre
            </Heading>
            <BodyShort spacing>
                Når sykmeldingen er sendt, får den som er sykmeldt en SMS fra Nav som bekrefter at vi har mottatt den.
            </BodyShort>
            <BodyShort spacing>
                Deretter kan den sykmeldte besøke{' '}
                <AkselLink href="https://www.nav.no/syk/sykefravaer" target="_blank">
                    Ditt Sykefravær (krever innlogging)
                </AkselLink>{' '}
                for å sende sykmeldingen videre til arbeidsgiveren eller til Nav, dersom det er nødvendig.
            </BodyShort>
        </div>
    )
}

function SykmeldingKvitteringError({ error, refetch }: { error: Error; refetch: () => void }): ReactElement {
    return (
        <div className="max-w-prose mb-4">
            <SimpleAlert level="error" title="Kunne ikke hente sykmeldingen" retry={refetch}>
                {`Teknisk feilmelding: ${error.message}`}
            </SimpleAlert>
        </div>
    )
}

export default SykmeldingKvittering
