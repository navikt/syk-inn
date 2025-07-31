'use client'

import { Alert, BodyShort, Button, Heading, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import TidligereSykmeldingView from '@features/tidligere-sykmelding/TidligereSykmelding'
import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { LoadablePageHeader, PageLayout } from '@components/layout/Page'

function SykmeldingPage(): ReactElement {
    const param = useParams<{ sykmeldingId: string }>()
    const pasientQuery = useQuery(PasientDocument)
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: param.sykmeldingId },
    })

    return (
        <PageLayout
            heading={<LoadablePageHeader lead="Sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />}
        >
            {error && (
                <Alert variant="error">
                    <Heading size="small" level="3" spacing>
                        Kunne ikke hente sykmelding
                    </Heading>
                    <BodyShort spacing>Det oppstod en feil under henting av sykmeldingen.</BodyShort>
                    <Button size="xsmall" variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv på nytt
                    </Button>
                </Alert>
            )}
            {loading && <Skeleton variant="rounded" className="max-w-prose " />}
            {!loading && data?.sykmelding && <TidligereSykmeldingView sykmelding={data.sykmelding} />}
            {!loading && !data?.sykmelding && (
                <Alert variant="error">
                    <Heading size="small" level="3" spacing>
                        Sykmelding ikke funnet
                    </Heading>
                    <BodyShort spacing>Fant ingen sykmelding med denne ID-en.</BodyShort>
                </Alert>
            )}
            <div className="flex justify-end p-4 max-w-prose">
                <Link href="/fhir">Lukk</Link>
            </div>
        </PageLayout>
    )
}

export default SykmeldingPage
