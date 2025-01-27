'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { skipToken, useQuery } from '@tanstack/react-query'
import { oauth2 } from 'fhirclient'
import { Alert, BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { ErrorBoundary } from 'react-error-boundary'
import dynamic from 'next/dynamic'

import { isLocalOrDemo } from '@utils/env'
import { getAbsoluteURL, pathWithBasePath } from '@utils/url'
import Test from '@fhir/components/Test'
import { createFhirDataService } from '@fhir/fhir-data/fhir-data-service'

import { DataProvider } from '../../data-fetcher/data-provider'

const FhirHeaderUser = dynamic(() => import('@fhir/components/FhirHeaderUser'), { ssr: false })

/**
 * The FHIR library requires asynchronous initialization, so this component is used to handle the loading state, error state
 * and wraps the rest of the tree in a provider when the client is ready.
 */
function FhirDataProvider({ children }: PropsWithChildren): ReactElement {
    const client = useQuery({
        queryKey: ['fhir-client'],
        queryFn: () => oauth2.ready(),
    })
    const fhirDataService = useQuery({
        queryKey: ['fhir-data-service'],
        queryFn: client.isSuccess ? () => createFhirDataService(client.data) : skipToken,
    })

    return (
        <div>
            <FhirHeaderUser
                isLoading={client.isLoading || fhirDataService.isLoading}
                behandler={fhirDataService.data?.context.behandler}
            />
            {(client.isLoading || fhirDataService.isLoading) && (
                <div className="max-w-prose flex-col flex gap-3">
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                </div>
            )}
            {(client.isError || fhirDataService.isError) && (
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
                                <a href={pathWithBasePath(`/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir`}`)}>
                                    Re-launch lokal FHIR context
                                </a>
                            </div>
                        )}
                        <Detail className="mt-4">Teknisk feilmelding</Detail>
                        {client.error?.message && <pre className="text-xs">{client.error.message}</pre>}
                        {fhirDataService.error?.message && (
                            <pre className="text-xs">{fhirDataService.error.message}</pre>
                        )}
                    </Alert>
                </div>
            )}
            {fhirDataService.data && <DataProvider dataService={fhirDataService.data}>{children}</DataProvider>}
            {/* TODO: This is debug-only development code, used only to inspect the JSON payload, will be removed. */}
            {isLocalOrDemo && (
                <ErrorBoundary fallback={<div className="mt-8">Test komponent tryna</div>}>
                    <Test />
                </ErrorBoundary>
            )}
        </div>
    )
}

export default FhirDataProvider
