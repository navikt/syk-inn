import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, BodyShort, Detail, Loader, TextField } from '@navikt/ds-react'

import { assertResourceAvailable, isResourceAvailable, PatientInfo } from '../data-provider/NySykmeldingFormDataService'
import { useController, useFormContext } from '../NySykmeldingFormValues'
import { useNySykmeldingDataService } from '../data-provider/NySykmeldingFormDataProvider'

export function PasientSearchField({ children }: PropsWithChildren): ReactElement {
    const dataService = useNySykmeldingDataService()

    const formContext = useFormContext()
    const value = formContext.watch('pasient')

    const { data, isLoading, error } = useQuery({
        queryKey: ['form', value] as const,
        queryFn: (): Promise<PatientInfo> => {
            assertResourceAvailable(dataService.query.pasient)

            return dataService.query.pasient(value ?? '')
        },
        enabled: value?.length === 11 && isResourceAvailable(dataService.query.pasient),
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
            />
            <div className="flex">
                {!isResourceAvailable(dataService.query.pasient) ? (
                    <BodyShort className="mt-2">Pasient søk er ikke tilgjengelig</BodyShort>
                ) : (
                    <Detail className="mt-2">
                        Valgt pasient: {data?.oid?.nr ?? 'N/A'}, {data?.navn ?? 'N/A'}
                    </Detail>
                )}

                {isLoading && <Loader size="xsmall" />}
                {error && <Alert variant="error">Error: {error.message}</Alert>}
            </div>
        </div>
    )
}
