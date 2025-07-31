'use client'

import React, { ReactElement, useRef } from 'react'
import {
    Alert,
    BodyShort,
    Button,
    Detail,
    ExpansionCard,
    Heading,
    Label,
    Link as AkselLink,
    Skeleton,
} from '@navikt/ds-react'
import { HandBandageIcon, PersonIcon, TabsAddIcon, VitalsIcon } from '@navikt/aksel-icons'
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import * as R from 'remeda'

import { toReadableDatePeriod } from '@lib/date'
import { SykmeldingByIdDocument } from '@queries'
import { pathWithBasePath } from '@lib/url'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { SlowNextLinkButton } from '@components/links/SlowNextLinkButton'
import { AssableNextLink } from '@components/links/AssableNextLink'

import { SykmeldingSynchronization } from './SykmeldingSynchronization'
import { Section } from './SykmeldingKvitteringSection'
import { DocumentStatusSuccess } from './DocumentStatus'

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
            {!error && (
                <ExpansionCard aria-label="Innsendte opplysninger">
                    <ExpansionCard.Header>
                        <ExpansionCard.Title>Innsendte opplysninger</ExpansionCard.Title>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        {data?.sykmelding ? (
                            <>
                                <Section title="Den sykmeldte" icon={<PersonIcon />}>
                                    <Detail>Fødselsnummer</Detail>
                                    <BodyShort>{data.sykmelding.meta.pasientIdent}</BodyShort>
                                </Section>
                                <Section title="Diagnose" icon={<HandBandageIcon />}>
                                    <Label>Hoveddiagnose</Label>
                                    {data.sykmelding.values.hoveddiagnose != null ? (
                                        <>
                                            <BodyShort>
                                                {data.sykmelding.values.hoveddiagnose.code} -{' '}
                                                {data.sykmelding.values.hoveddiagnose.text}
                                            </BodyShort>
                                            <Detail>{data.sykmelding.values.hoveddiagnose.system}</Detail>
                                        </>
                                    ) : (
                                        <BodyShort>Ingen hoveddiagnose er satt</BodyShort>
                                    )}

                                    {(data.sykmelding.values.bidiagnoser ?? []).some((b) => b != null) && (
                                        <>
                                            <Label className="mt-4">Bidiagnoser</Label>
                                            {(data.sykmelding.values.bidiagnoser ?? [])
                                                .filter(R.isNonNull)
                                                .map((bidiagnose, index) => (
                                                    <div key={index}>
                                                        <BodyShort>
                                                            {bidiagnose.code} - {bidiagnose.text}
                                                        </BodyShort>
                                                        <Detail>{bidiagnose.system}</Detail>
                                                    </div>
                                                ))}
                                        </>
                                    )}
                                </Section>
                                <Section title="Aktivitet" icon={<VitalsIcon />}>
                                    <Detail>Sykmeldingsperiode</Detail>
                                    <BodyShort>
                                        {toReadableDatePeriod(
                                            data.sykmelding.values.aktivitet[0].fom,
                                            data.sykmelding.values.aktivitet[0].tom,
                                        )}
                                    </BodyShort>
                                </Section>
                            </>
                        ) : (
                            <>
                                <Skeleton />
                            </>
                        )}
                    </ExpansionCard.Content>
                </ExpansionCard>
            )}
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
