'use client'

import { oauth2 } from 'fhirclient'
import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Accordion, Alert, BodyShort, Detail, Heading } from '@navikt/ds-react'

import { getBaseURL } from '@utils/url'

function Test(): ReactElement {
    const { data, error, isFetching } = useQuery({
        queryKey: ['pasient-debug'],
        queryFn: async () => {
            const client = await oauth2.ready()

            return client.request('Patient')
        },
    })

    if (isFetching) return <div>Loading...</div>
    if (error) {
        return (
            <>
                <Alert variant="error" className="mb-4">
                    Error: {error.message}
                </Alert>
                <a href={`/fhir/launch?iss=${getBaseURL()}/api/fhir-mock`}>Re-do local FHIR launch?</a>
            </>
        )
    }
    return (
        <Accordion className="max-w-prose mt-8">
            <Accordion.Item defaultOpen={false}>
                <Accordion.Header>Se fullstendig Pasient JSON</Accordion.Header>
                <Accordion.Content>
                    <Heading level="3" size="small">
                        Pasient
                    </Heading>
                    <BodyShort>
                        {data.name[0].family}, {data.name[0].given[0]}, {data.gender}
                    </BodyShort>
                    <BodyShort spacing>Lege: {data.generalPractitioner[0].display}</BodyShort>

                    <Detail>Full response:</Detail>
                    <pre className="text-xs bg-bg-subtle p-1 w-fit overflow-auto border border-border-subtle">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </Accordion.Content>
            </Accordion.Item>
        </Accordion>
    )
}

export default Test
