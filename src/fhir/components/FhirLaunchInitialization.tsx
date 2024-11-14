'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { oauth2 } from 'fhirclient'
import { Skeleton } from '@navikt/ds-react'

import { FhirError } from '@fhir/components/FhirError'

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
                clientId: 'syk-inn',
                scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
            })
            return null
        },
    })

    if (error) {
        return <FhirError />
    }

    return (
        <div className="max-w-prose flex-col flex gap-3">
            <Skeleton height={192} variant="rounded" />
            <Skeleton height={192} variant="rounded" />
            <Skeleton height={192} variant="rounded" />
        </div>
    )
}

export default FhirLaunchInitialization
