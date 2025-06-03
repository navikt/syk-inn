'use client'

import React, { ReactElement, useEffect } from 'react'
import {
    Alert,
    BodyLong,
    BodyShort,
    Button,
    Detail,
    GuidePanel,
    Heading,
    Label,
    Link as AkselLink,
    Skeleton,
} from '@navikt/ds-react'
import { HandBandageIcon, PersonIcon, VitalsIcon } from '@navikt/aksel-icons'
import Link from 'next/link'
import { useQuery } from '@apollo/client'

import { FormSection } from '@components/ui/form'
import { toReadableDatePeriod } from '@utils/date'
import { SykmeldingSynchronization } from '@components/existing-sykmelding-kvittering/SykmeldingSynchronization'
import { SykmeldingByIdDocument, SykmeldingFragment } from '@queries'

import { DocumentStatusSuccess } from './DocumentStatus'

type ExistingSykmeldingKvitteringProps = {
    sykmeldingId: string
}

function ExistingSykmeldingKvittering({ sykmeldingId }: ExistingSykmeldingKvitteringProps): ReactElement {
    const { loading, data, error, refetch, stopPolling } = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
        pollInterval: 5000,
    })

    useEffect(() => {
        if (data?.sykmelding?.documentStatus === 'COMPLETE') {
            stopPolling()
        }
    }, [data?.sykmelding?.documentStatus, stopPolling])

    return (
        <div className="max-w-prose bg-white p-4 rounded-sm">
            {loading && <SykmeldingKvitteringSkeleton />}
            {error && <SykmeldingKvitteringError error={error} refetch={refetch} />}
            {data?.sykmelding && (
                <div>
                    <SykmeldingKvittering sykmelding={data.sykmelding} />
                    {data.sykmelding?.documentStatus === 'COMPLETE' ? (
                        <DocumentStatusSuccess />
                    ) : (
                        <SykmeldingSynchronization sykmeldingId={sykmeldingId} />
                    )}
                </div>
            )}
        </div>
    )
}

function SykmeldingKvittering({ sykmelding }: { sykmelding: SykmeldingFragment }): ReactElement {
    return (
        <div className="max-w-prose">
            <div className="mb-4">
                <Alert variant="success">Nav har mottatt sykmeldingen og sendt den til den sykmeldte</Alert>
            </div>
            <div className="flex flex-col gap-3">
                <FormSection title="Den sykmeldte" icon={<PersonIcon />}>
                    <Detail>Fødselsnummer</Detail>
                    <BodyShort>{sykmelding.pasient.ident}</BodyShort>
                </FormSection>
                <FormSection title="Diagnose" icon={<HandBandageIcon />}>
                    <Label>Hoveddiagnose</Label>
                    <BodyShort>
                        {sykmelding.diagnose.hoved.code} - {sykmelding.diagnose.hoved.text}
                    </BodyShort>
                    <Detail>{sykmelding.diagnose.hoved.system}</Detail>
                </FormSection>
                <FormSection title="Aktivitet" icon={<VitalsIcon />}>
                    <Detail>Sykmeldingsperiode</Detail>
                    <BodyShort>{toReadableDatePeriod(sykmelding.aktivitet.fom, sykmelding.aktivitet.tom)}</BodyShort>
                </FormSection>
            </div>
            <div className="mt-8">
                <AkselLink href={`/fhir/pdf/${sykmelding.sykmeldingId}`} target="_blank">
                    Se innsendt dokument
                </AkselLink>
            </div>
            <div className="mt-4">
                <GuidePanel poster>
                    <BodyLong spacing>
                        Den sykmeldte vil kunne logge på{' '}
                        <AkselLink href="https://www.nav.no/syk/sykefravaer" target="_blank">
                            Ditt Sykefravær
                        </AkselLink>{' '}
                        for å sende inn sykmeldingen til arbeidsgiver eller Nav.
                    </BodyLong>
                    <BodyLong>
                        Den sykmeldte vil også motta SMS med informasjon om at vi ha mottatt sykmeldingen.
                    </BodyLong>
                </GuidePanel>
            </div>
            <div className="mt-8">
                <Link href="/fhir" className="underline">
                    Tilbake til pasientoversikt
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
