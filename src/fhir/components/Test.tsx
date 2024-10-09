'use client'

import { oauth2 } from 'fhirclient'
import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Accordion, Alert, Detail, Heading } from '@navikt/ds-react'

function Test(): ReactElement {
    const { data, error, isFetching } = useQuery({
        queryKey: ['pasient-debug'],
        queryFn: async () => {
            const client = await oauth2.ready()

            return client.request('Patient')
        },
    })

    return (
        <Accordion className="max-w-prose mt-8">
            <Accordion.Item defaultOpen={false}>
                <Accordion.Header>Se fullstendig Pasient JSON</Accordion.Header>
                <Accordion.Content>
                    <Heading level="3" size="small">
                        Pasient
                    </Heading>
                    {isFetching && <p>Loading...</p>}
                    {error && (
                        <Alert variant="error" className="mb-4">
                            Error: {error.message}
                        </Alert>
                    )}
                    {data && (
                        <>
                            <Detail>Full response:</Detail>
                            <pre className="text-xs bg-bg-subtle p-1 w-fit overflow-auto border border-border-subtle">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </>
                    )}
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    )
}

export default Test
