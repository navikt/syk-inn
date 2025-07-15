'use client'

import { Alert, BodyShort, Button, Heading, Page, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import TidligereSykmeldingView from '@components/sykmelding/TidligereSykmeldingView'

import { earliestFom, latestTom } from '../../../../../../data-layer/common/sykmelding-utils'

function SykmeldingPage(): ReactElement {
    const param = useParams<{ sykmeldingId: string }>()
    const pasientQuery = useQuery(PasientDocument)

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    <span>Sykmelding for</span>
                    {pasientQuery.loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasientQuery.data?.pasient && ` ${pasientQuery.data.pasient.navn} `}
                </Heading>
                <TidligereSykmelding sykmeldingId={param.sykmeldingId} />
            </PageBlock>
        </Page>
    )
}

function TidligereSykmelding({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })

    if (loading) {
        return <Skeleton variant="rounded" className="max-w-prose " />
    }

    if (error) {
        return (
            <Alert variant="error">
                <Heading size="small" level="3" spacing>
                    Kunne ikke hente sykmelding
                </Heading>
                <BodyShort spacing>Det oppstod en feil under henting av sykmeldingen.</BodyShort>
                <Button size="xsmall" variant="secondary-neutral" onClick={() => refetch()}>
                    Prøv på nytt
                </Button>
            </Alert>
        )
    }

    if (!data?.sykmelding) {
        return (
            <Alert variant="error">
                <Heading size="small" level="3" spacing>
                    Sykmelding ikke funnet
                </Heading>
                <BodyShort spacing>Fant ingen sykmelding med denne ID-en.</BodyShort>
            </Alert>
        )
    }

    const earliestPeriode = earliestFom(data.sykmelding)
    const latestPeriode = latestTom(data.sykmelding)

    if (!earliestPeriode || !latestPeriode) {
        return (
            <Alert variant="info">
                <Heading size="small" level="3" spacing>
                    Ufullstendig sykmelding
                </Heading>
                <BodyShort spacing>
                    Dette skal ikke kunne skje, dette kan være en eldre sykmelding, eller noe som har gått galt i
                    systemet. Vennligst kontakt support dersom dette vedvarer.
                </BodyShort>
            </Alert>
        )
    }

    if (error) {
        return (
            <Alert variant="error">
                <BodyShort>Kunne ikke hente sykmelding</BodyShort>
                <Button size="small" onClick={() => refetch()}>
                    Prøv på nytt
                </Button>
            </Alert>
        )
    }

    return (
        <div>
            <TidligereSykmeldingView sykmelding={data.sykmelding} />
            <div className="flex justify-end p-4">
                <Link href="/fhir">Lukk</Link>
            </div>
        </div>
    )
}

export default SykmeldingPage
