'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Alert,
    BodyLong,
    BodyShort,
    Button,
    Detail,
    GuidePanel,
    Heading,
    Label,
    Link as AskelLink,
    Skeleton,
} from '@navikt/ds-react'
import { HandBandageIcon, PersonIcon, VitalsIcon } from '@navikt/aksel-icons'
import Link from 'next/link'

import { FormSection } from '@components/ui/form'
import { toReadableDatePeriod } from '@utils/date'

import { useDataService } from '../../data-fetcher/data-provider'
import { ExistingSykmelding } from '../../data-fetcher/data-service'

type Props = {
    sykmeldingId: string
}

function ExistingSykmeldingKvittering({ sykmeldingId }: Props): ReactElement {
    const dataService = useDataService()
    const { isLoading, data, error, refetch } = useQuery({
        queryKey: ['sykmelding', sykmeldingId],
        queryFn: async () => dataService.query.sykmelding(sykmeldingId),
    })

    return (
        <div>
            {isLoading && <SykmeldingKvitteringSkeleton />}
            {error && <SykmeldingKvitteringError error={error} refetch={refetch} />}
            {data && (
                <div>
                    <SykmeldingKvittering sykmelding={data} />
                    <WritebackStatus sykmeldingId={data.sykmeldingId} />
                </div>
            )}
        </div>
    )
}

function WritebackStatus({ sykmeldingId }: Props): ReactElement {
    const dataService = useDataService()

    const { isLoading, data, error, refetch } = useQuery({
        queryKey: ['sykmeldingId', sykmeldingId],
        queryFn: async () => dataService.mutation.writeToEhr(sykmeldingId),
    })

    if (isLoading) {
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

    if (error) {
        return (
            <div className="max-w-prose">
                <div className="my-4">
                    <Heading size="small" level="3">
                        Kunne ikke skrive sykmeldingen til EPJ-systemet.
                    </Heading>
                </div>

                <div className="mt-4">
                    <Alert variant="error">Teknisk feilmelding: {error.message}</Alert>
                </div>

                <div className="mt-4">
                    <Button variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv å skrive til EPJ på nytt
                    </Button>
                </div>
            </div>
        )
    }

    if (!data || !data.id) {
        return (
            <div className="mt-4">
                <Alert variant="warning">Data er ikke tilgjengelig ennå. Vennligst prøv igjen senere.</Alert>
                <div className="mt-4">
                    <Button variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv igjen
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="my-4">
            <Heading size="small" level="3">
                Sykmelding er skrevet til EPJ-systemet og lagret på DokumentReferanse: ${data.id}
            </Heading>
        </div>
    )
}

function SykmeldingKvittering({ sykmelding }: { sykmelding: ExistingSykmelding }): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="my-4">
                <Alert variant="success">Nav har mottatt sykmeldingen og sendt den til den sykmeldte</Alert>
            </div>
            <div className="flex flex-col gap-3">
                <FormSection title="Den sykmeldte" icon={<PersonIcon />}>
                    <Detail>Fødselsnummer</Detail>
                    <BodyShort>{sykmelding.pasient.fnr}</BodyShort>
                </FormSection>
                <FormSection title="Diagnose" icon={<HandBandageIcon />}>
                    <Label>Hoveddiagnose</Label>
                    <BodyShort>
                        {sykmelding.hovedDiagnose.code} - {sykmelding.hovedDiagnose.text}
                    </BodyShort>
                    <Detail>{sykmelding.hovedDiagnose.system}</Detail>
                </FormSection>
                <FormSection title="Aktivitet" icon={<VitalsIcon />}>
                    <Detail>Sykmeldingsperiode</Detail>
                    <BodyShort>{toReadableDatePeriod(sykmelding.aktivitet.fom, sykmelding.aktivitet.tom)}</BodyShort>
                </FormSection>
            </div>
            <div className="mt-4">
                <GuidePanel poster>
                    <BodyLong spacing>
                        Den sykmeldte vil kunne logge på{' '}
                        <AskelLink href="https://www.nav.no/syk/sykefravaer" target="_blank">
                            Ditt Sykefravær
                        </AskelLink>{' '}
                        for å sende inn sykmeldingen til arbeidsgiver eller Nav.
                    </BodyLong>
                    <BodyLong>
                        Den sykmeldte vil også motta SMS med informasjon om at vi ha mottatt sykmeldingen.
                    </BodyLong>
                </GuidePanel>
            </div>
            <div className="mt-8">
                <Link href="/fhir" className="underline">
                    Lag en ny sykmelding for samme pasient
                </Link>
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

export default ExistingSykmeldingKvittering
