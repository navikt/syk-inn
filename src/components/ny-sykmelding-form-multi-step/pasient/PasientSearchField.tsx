import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, BodyShort, Detail, Loader, TextField } from '@navikt/ds-react'
import { useController, useForm } from 'react-hook-form'

import { assertResourceAvailable, isResourceAvailable } from '../../../data-fetcher/data-service'
import { useDataService } from '../../../data-fetcher/data-provider'

type PasientSearchFormValues = {
    pasient: string
}

export function PasientSearchField({ children }: PropsWithChildren): ReactElement {
    const pasientForm = useForm<PasientSearchFormValues>()
    const identField = useController({
        control: pasientForm.control,
        name: 'pasient',
        rules: {
            required: 'Fødselsnummer eller D-nummer er påkrevd',
            pattern: {
                value: /^\d{11}$/,
                message: 'Fødselsnummer eller D-nummer må være 11 siffer',
            },
        },
    })

    const dataService = useDataService()
    const { data, isLoading, error } = useQuery({
        queryKey: ['form', identField.field.value] as const,
        queryFn: () => {
            assertResourceAvailable(dataService.query.pasient)

            return dataService.query.pasient(identField.field.value ?? '')
        },
        enabled: identField.field.value?.length === 11 && isResourceAvailable(dataService.query.pasient),
        retry: (count, error) => {
            // Stop retry when PDL doesn't find the person
            if (error.message === 'Fant ikke person i registeret') return false
            return count >= 3
        },
    })

    return (
        <form>
            {children}
            <TextField
                id={identField.field.name}
                label="Fødselsnummer eller D-nummer"
                {...identField.field}
                value={identField.field.value ?? ''}
                error={identField.fieldState.error?.message}
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
                        <BodyShort spacing>{data.ident} </BodyShort>
                    </div>
                )}

                <div className="mt-2">
                    {isLoading && <Loader variant="interaction" size="small" title="Henter person..." />}
                    {error && <Alert variant="error">{error.message}</Alert>}
                </div>
            </div>
        </form>
    )
}
