'use client'

import React, { ReactElement } from 'react'
import { Alert, BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import Link from 'next/link'
import { oauth2 } from 'fhirclient'
import { useQuery } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { PageBlock } from '@navikt/ds-react/Page'

import Test from '@fhir/components/Test'
import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding/NySykmeldingForm'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { getAbsoluteURL, pathWithBasePath } from '@utils/url'

import { createFhirFetcher } from './fhir-context'

function Page(): ReactElement {
    const client = useQuery({
        queryKey: ['fhir-client'],
        queryFn: async () => {
            return oauth2.ready()
        },
    })

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>
            {client.isLoading && (
                <div className="max-w-prose flex-col flex gap-3">
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                </div>
            )}
            {client.isError && (
                <div className="max-w-prose">
                    <Alert variant="error">
                        <Heading level="3" size="medium">
                            Oppstart av applikasjon feilet
                        </Heading>
                        <BodyShort spacing>
                            Det skjedde en feil under oppstart av applikasjonen. Dette kan skyldes at du ikke har
                            tilgang til FHIR-serveren. Du kan prøve å starte applikasjonen på nytt.
                        </BodyShort>
                        <BodyShort>Dersom problemet vedvarer, ta kontakt med brukerstøtte.</BodyShort>

                        {isLocalOrDemo && (
                            <div className="mt-4">
                                <Detail>Dev only</Detail>
                                <a href={pathWithBasePath(`/fhir/launch?iss=${`${getAbsoluteURL()}/api/fhir-mock`}`)}>
                                    Re-launch lokal FHIR context
                                </a>
                            </div>
                        )}
                        <Detail className="mt-4">Teknisk feilmelding</Detail>
                        <pre className="text-xs">{client.error.message}</pre>
                    </Alert>
                </div>
            )}
            {client.data && (
                <NySykmeldingFormDataProvider dataService={createFhirFetcher(client.data)}>
                    <NySykmeldingForm />
                </NySykmeldingFormDataProvider>
            )}
            <ErrorBoundary fallback={<div className="mt-8">Test komponent tryna</div>}>
                <Test />
            </ErrorBoundary>
        </PageBlock>
    )
}

export default Page
