'use client'

import { Alert, BodyShort, Button, Heading, Skeleton } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import TidligereSykmeldingView from '@features/tidligere-sykmelding/TidligereSykmelding'
import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { PageLayout } from '@components/layout/Page'

function SykmeldingPage(): ReactElement {
    const param = useParams<{ sykmeldingId: string }>()
    const pasientQuery = useQuery(PasientDocument)
    const { loading, data, error, refetch } = useQuery(SykmeldingByIdDocument, {
        variables: { id: param.sykmeldingId },
    })

    return (
        <PageLayout
            heading={
                <>
                    <span>Sykmelding for</span>
                    {pasientQuery.loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasientQuery.data?.pasient && ` ${pasientQuery.data.pasient.navn} `}
                </>
            }
        >
            {loading && <Skeleton variant="rounded" className="max-w-prose " />}
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
            {data?.sykmelding ? (
                <TidligereSykmeldingView sykmelding={data.sykmelding} />
            ) : (
                <Alert variant="error">
                    <Heading size="small" level="3" spacing>
                        Sykmelding ikke funnet
                    </Heading>
                    <BodyShort spacing>Fant ingen sykmelding med denne ID-en.</BodyShort>
                </Alert>
            )}
            <div className="flex justify-end p-4">
                <Link href="/fhir">Lukk</Link>
            </div>
        </PageLayout>
    )
}

export default SykmeldingPage
