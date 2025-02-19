import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, BodyShort, Detail, Loader, TextField } from '@navikt/ds-react'

import { assertResourceAvailable, isResourceAvailable } from '../../../data-fetcher/data-service'
import { useController, useFormContext } from '../NySykmeldingFormValues'
import { useDataService } from '../../../data-fetcher/data-provider'

export function PasientSearchField({ children }: PropsWithChildren): ReactElement {
    const dataService = useDataService()

    const formContext = useFormContext()
    const value = formContext.watch('pasient')

    const { data, isLoading, error } = useQuery({
        queryKey: ['form', value] as const,
        queryFn: () => {
            assertResourceAvailable(dataService.query.pasient)

            return dataService.query.pasient(value ?? '')
        },
        enabled: value?.length === 11 && isResourceAvailable(dataService.query.pasient),
        retry: (count, error) => {
            // Stop retry when PDL doesn't find the person
            if (error.message === 'Fant ikke person i registeret') return false
            return count >= 3
        },
    })
    const oidField = useController({
        name: 'pasient',
        rules: {
            required: 'Fødselsnummer eller D-nummer er påkrevd',
            pattern: {
                value: /^\d{11}$/,
                message: 'Fødselsnummer eller D-nummer må være 11 siffer',
            },
        },
    })

    return (
        <div>
            {children}
            <TextField
                id={oidField.field.name}
                label="Fødselsnummer eller D-nummer"
                {...oidField.field}
                value={oidField.field.value ?? ''}
                error={oidField.fieldState.error?.message}
                placeholder="11 siffer"
                maxLength={11}
                disabled={isLoading}
            />
            <div className="flex flex-col">
                {!isResourceAvailable(dataService.query.pasient) && (
                    <BodyShort className="mt-2">Pasient søk er ikke tilgjengelig</BodyShort>
                )}
                {data && (
                    <div className="mt-2">
                        <Detail>Navn</Detail>
                        <BodyShort spacing>{data.navn}</BodyShort>
                        <Detail>ID-nummer</Detail>
                        <BodyShort spacing>{data.ident}</BodyShort>
                    </div>
                )}

                <div className="mt-2">
                    {isLoading && <Loader variant="interaction" size="small" title="Henter person..." />}
                    {error && <Alert variant="error">{error.message}</Alert>}
                </div>
            </div>
        </div>
    )
}
