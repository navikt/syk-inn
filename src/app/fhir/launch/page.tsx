'use client'

import React, { ReactElement, useEffect } from 'react'
import { oauth2 } from 'fhirclient'
import { useMutation } from '@tanstack/react-query'
import { Alert, Heading, Loader } from '@navikt/ds-react'

function Page(): ReactElement {
    const { mutate, data, error, isPending } = useMutation({
        mutationKey: ['launch'],
        mutationFn: async () =>
            oauth2.authorize({
                clientId: 'my_web_app',
                scope: 'patient/*.read',
            }),
    })

    useEffect(() => {
        mutate()
    }, [mutate])

    return (
        <div className="p-8">
            <Heading level="2" size="medium" spacing>
                LETS GO FHIR
            </Heading>
            {data != null && <Alert variant="success">Success: {JSON.stringify(data)}</Alert>}
            {isPending && <Loader size="3xlarge" />}
            {error && <Alert variant="error">Error: {error.message}</Alert>}
        </div>
    )
}

export default Page
