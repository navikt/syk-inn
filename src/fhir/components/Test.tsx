'use client'

import { oauth2 } from 'fhirclient'
import React, { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert } from '@navikt/ds-react'

function Test(): ReactElement {
    const { data, error, isFetching } = useQuery({
        queryKey: ['pasient'],
        queryFn: async () => {
            const client = await oauth2.ready()

            return client.request('Patient')
        },
    })

    if (isFetching) return <div>Loading...</div>
    if (error) {
        return (
            <>
                <Alert variant="error">Error: {error.message}</Alert>
                <a href="/fhir/launch?iss=http://localhost:3000/api/fhir-mock">Re-do local FHIR launch?</a>
            </>
        )
    }
    return <div>{JSON.stringify(data, null, 2)}</div>
}

export default Test
