'use client'

import React, { ReactElement } from 'react'
import { oauth2 } from 'fhirclient'
import { useQuery } from '@tanstack/react-query'
import { Alert, Heading, Skeleton } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'

function Page(): ReactElement {
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
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                Starter applikasjon for sykmeldinger
            </Heading>
            {!error ? (
                <div className="max-w-prose flex-col flex gap-3">
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                    <Skeleton height={192} variant="rounded" />
                </div>
            ) : (
                <Alert variant="error">Error: {error.message}</Alert>
            )}
        </PageBlock>
    )
}

export default Page
