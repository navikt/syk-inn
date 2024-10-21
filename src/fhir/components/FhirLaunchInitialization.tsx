'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { oauth2 } from 'fhirclient'
import { Alert, Skeleton } from '@navikt/ds-react'

/**
 * Not the most idiomatic use of tanstack-query, but since the fhirclient uses a redirect based flow for the auth flow,
 * tanstack-query is used to handle the (implicit) loading state and eventual error state. The happy-state is being redirected
 * away from this component.
 */
function FhirLaunchInitialization(): ReactElement {
    const { error } = useQuery({
        queryKey: ['fhir-initialization'],
        queryFn: async () => {
            await oauth2.authorize({
                clientId: 'nav/syk-inn',
                scope: 'openid profile fhirUser launch patient/*.read',
            })
            return null
        },
    })

    return (
        <div>
            {!error ? (
                <div className="max-w-prose flex-col flex gap-3">
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                </div>
            ) : (
                <Alert variant="error">Error: {error.message}</Alert>
            )}
        </div>
    )
}

export default FhirLaunchInitialization
