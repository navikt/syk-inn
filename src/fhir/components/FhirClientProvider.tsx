'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { oauth2 } from 'fhirclient'
import { Alert, BodyShort, Detail, Heading, Skeleton } from '@navikt/ds-react'
import { ErrorBoundary } from 'react-error-boundary'

import { isLocalOrDemo } from '@utils/env'
import { getAbsoluteURL, pathWithBasePath } from '@utils/url'
import { NySykmeldingFormDataProvider } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataProvider'
import Test from '@fhir/components/Test'

import { createFhirDataService } from '../data-fetching/fhir-data-service'

/**
 * The FHIR library requires asynchronous initialization, so this component is used to handle the loading state, error state
 * and wraps the rest of the tree in a provider when the client is ready.
 */
function FhirClientProvider({ children }: PropsWithChildren): ReactElement {
    const client = useQuery({
        queryKey: ['fhir-client'],
        queryFn: async () => {
            return oauth2.ready()
        },
    })

    return (
        <div>
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
                <NySykmeldingFormDataProvider dataService={createFhirDataService(client.data)}>
                    {children}
                </NySykmeldingFormDataProvider>
            )}
            {/* TODO: This is debug-only development code, used only to inspect the JSON payload, will be removed. */}
            {isLocalOrDemo && (
                <ErrorBoundary fallback={<div className="mt-8">Test komponent tryna</div>}>
                    <Test />
                </ErrorBoundary>
            )}
        </div>
    )
}

export default FhirClientProvider
