'use client'

import { Alert, BodyShort, Button, Heading, Page, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import * as R from 'remeda'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { toReadableDatePeriod } from '@utils/date'

function SykmeldingPage(): ReactElement {
    const param = useParams<{ sykmeldingId: string }>()
    const pasientQuery = useQuery(PasientDocument)

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    <span>Tidligere sykmelding for</span>
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

    const earliestPeriode = R.firstBy(data.sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])
    const latestPeriode = R.firstBy(data.sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])

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

    return (
        <div className="bg-bg-default p-4 rounded-sm">
            <Heading level="3" size="medium">
                Sykmelding {toReadableDatePeriod(earliestPeriode.fom, latestPeriode.tom)}
            </Heading>
            <div>TODO: Sykmelding visning</div>
        </div>
    )
}

export default SykmeldingPage
