import React, { PropsWithChildren, ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Alert, Detail, Loader, TextField } from '@navikt/ds-react'

import { NySykmeldingFormValues } from '@components/ny-sykmelding/NySykmeldingFormValues'
import { useNySykmeldingDataService } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import {
    assertResourceAvailable,
    PatientInfo,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataService'

export function PasientSearchField({ children }: PropsWithChildren): ReactElement {
    const formContext = useFormContext<NySykmeldingFormValues>()
    const value = formContext.watch('pasient')

    const dataService = useNySykmeldingDataService()

    const { data, isLoading, error } = useQuery({
        queryKey: ['form', value] as const,
        queryFn: (): Promise<PatientInfo> => {
            assertResourceAvailable(dataService.query.getPasientByFnr)

            return dataService.query.getPasientByFnr(value ?? '')
        },
        enabled: value?.length === 11,
    })

    return (
        <div>
            {children}
            <TextField label="Test" placeholder="Passy" {...formContext.register('pasient')} />
            <div className="flex justify-center">
                <Detail className="mt-2">
                    Pasienten: {data?.fnr ?? 'N/A'}, {data?.navn ?? 'N/A'}
                </Detail>
                {isLoading && <Loader size="xsmall" />}
                {error && <Alert variant="error">Error: {error.message}</Alert>}
            </div>
        </div>
    )
}
