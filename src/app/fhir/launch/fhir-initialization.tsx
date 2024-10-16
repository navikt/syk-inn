'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { oauth2 } from 'fhirclient'
import { Alert, Skeleton } from '@navikt/ds-react'

function FhirInitialization(): ReactElement {
    const { error } = useQuery({
        queryKey: ['fhir-initialization'],
        queryFn: async () => {
            await oauth2.authorize({
                clientId: 'my_web_app',
                scope: 'patient/*.read',
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

export default FhirInitialization
