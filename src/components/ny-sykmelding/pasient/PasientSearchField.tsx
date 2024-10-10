import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Alert, Detail, Loader, TextField } from '@navikt/ds-react'

import { useFormContext } from '@components/ny-sykmelding/NySykmeldingFormValues'
import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    assertResourceAvailable,
    PatientInfo,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

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
        enabled: value?.length === 11,
    })

    return (
        <div>
            {children}
            <TextField label="Test" placeholder="Passy" {...formContext.register('pasient')} />
            <div className="flex justify-center">
                <Detail className="mt-2">
                    Pasienten: {data?.oid.nr ?? 'N/A'}, {data?.navn ?? 'N/A'}
                </Detail>
                {isLoading && <Loader size="xsmall" />}
                {error && <Alert variant="error">Error: {error.message}</Alert>}
            </div>
        </div>
    )
}
