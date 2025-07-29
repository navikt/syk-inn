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
import { SykmeldingByIdDocument, SykmeldingFragment } from '@queries'
import { pathWithBasePath } from '@lib/url'
import { SlowNextLinkButton } from '@components/misc/SlowNextLinkButton'
import { useAppDispatch } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import AssableNextLink from '@components/misc/AssableNextLink'

import { SykmeldingSynchronization } from './SykmeldingSynchronization'
import { Section } from './SykmeldingKvitteringSection'
import { DocumentStatusSuccess } from './DocumentStatus'

type Props = {
    sykmeldingId: string
}

function SykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })

    return (
        <div className="bg-white p-4 rounded-sm">
            {loading && <SykmeldingKvitteringSkeleton />}
            {error && <SykmeldingKvitteringError error={error} refetch={refetch} />}
            {data?.sykmelding && (
                <div className="flex flex-row gap-8">
                    <SykmeldingKvitteringWithData sykmelding={data.sykmelding} />
                    <div className="max-w-prose">
                        {data.sykmelding?.documentStatus === 'COMPLETE' ? (
                            <DocumentStatusSuccess />
                        ) : (
                            <SykmeldingSynchronization sykmeldingId={sykmeldingId} />
                        )}
                        <Heading level="3" size="small" className="mt-8" spacing>
                            Dette gjør Nav videre
                        </Heading>
                        <BodyShort spacing>
                            Når sykmeldingen er sendt, får den som er sykmeldt en SMS fra Nav som bekrefter at vi har
                            mottatt den.
                        </BodyShort>
                        <BodyShort spacing>
                            Deretter kan den sykmeldte logge inn på{' '}
                            <Link href="https://www.nav.no/syk/sykefravaer" target="_blank">
                                Ditt Sykefravær
                            </Link>{' '}
                            for å sende sykmeldingen videre til arbeidsgiveren eller til Nav, hvis det er nødvendig.
                        </BodyShort>
                    </div>
                </div>
            )}
        </div>
    )
}

function SykmeldingKvitteringWithData({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    const nextDraftId = useRef(crypto.randomUUID())
    const dispatch = useAppDispatch()
    return (
        <div className="max-w-prose">
            <div className="mb-4">
                <Alert variant="success">Nav har mottatt sykmeldingen og sendt den til den sykmeldte</Alert>
            </div>
            <div className="flex justify-between mt-8 mb-4">
                <Button variant="tertiary" size="small" as={AssableNextLink} href="/fhir" className="underline">
                    Tilbake til pasientoversikt
                </Button>

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
            </div>
            <ExpansionCard aria-label="Innsendte opplysninger">
                <ExpansionCard.Header>
                    <ExpansionCard.Title>Innsendte opplysninger</ExpansionCard.Title>
                </ExpansionCard.Header>
                <ExpansionCard.Content>
                    <Section title="Den sykmeldte" icon={<PersonIcon />}>
                        <Detail>Fødselsnummer</Detail>
                        <BodyShort>{sykmelding.meta.pasientIdent}</BodyShort>
                    </Section>
                    <Section title="Diagnose" icon={<HandBandageIcon />}>
                        <Label>Hoveddiagnose</Label>
                        {sykmelding.values.hoveddiagnose != null ? (
                            <>
                                <BodyShort>
                                    {sykmelding.values.hoveddiagnose.code} - {sykmelding.values.hoveddiagnose.text}
                                </BodyShort>
                                <Detail>{sykmelding.values.hoveddiagnose.system}</Detail>
                            </>
                        ) : (
                            <BodyShort>Ingen hoveddiagnose er satt</BodyShort>
                        )}

                        {(sykmelding.values.bidiagnoser ?? []).some((b) => b != null) && (
                            <>
                                <Label className="mt-4">Bidiagnoser</Label>
                                {(sykmelding.values.bidiagnoser ?? []).filter(R.isNonNull).map((bidiagnose, index) => (
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
                                sykmelding.values.aktivitet[0].fom,
                                sykmelding.values.aktivitet[0].tom,
                            )}
                        </BodyShort>
                    </Section>
                </ExpansionCard.Content>
            </ExpansionCard>

            <div className="mt-8">
                <AkselLink href={pathWithBasePath(`/fhir/pdf/${sykmelding.sykmeldingId}`)} target="_blank">
                    Se innsendt dokument
                </AkselLink>
            </div>
        </div>
    )
}

function SykmeldingKvitteringSkeleton(): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="my-4">
                <Skeleton variant="rectangle" height={62} />
            </div>
            <div className="flex flex-col gap-3">
                <Skeleton variant="rectangle" height={108} />
                <Skeleton variant="rectangle" height={132} />
                <Skeleton variant="rectangle" height={108} />
            </div>
            <div className="mt-4"></div>
        </div>
    )
}

function SykmeldingKvitteringError({ error, refetch }: { error: Error; refetch: () => void }): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="my-4">
                <Heading size="small" level="3">
                    Kunne ikke hente sykmeldingen
                </Heading>
            </div>

            <div className="mt-4">
                <Alert variant="error">Teknisk feilmelding: {error.message}</Alert>
            </div>

            <div className="mt-4">
                <Button variant="secondary-neutral" onClick={() => refetch()}>
                    Prøv å hente på nytt
                </Button>
            </div>
        </div>
    )
}

export default SykmeldingKvittering
