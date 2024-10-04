'use client'

import React, { ReactElement } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { logger } from '@navikt/next-logger'
import { Alert, Button, Detail, Loader, TextField } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'

import {
    useIsNySykmeldingDataServiceInitialized,
    useNySykmeldingDataService,
} from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { NySykmeldingFormValues } from '@components/ny-sykmelding/NySykmeldingFormValues'

function NySykmeldingForm(): ReactElement {
    const form = useForm<NySykmeldingFormValues>()

    if (!useIsNySykmeldingDataServiceInitialized()) {
        return (
            <div className="max-w-prose p-8">
                <Alert variant="warning">Skjemaet er ikke tilgjengelig uten pasient-data.</Alert>
            </div>
        )
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(
                    (values) => {
                        logger.info(`Form submit OK, values: ${JSON.stringify(values, null, 2)}`)
                    },
                    (errors) => {
                        logger.error(`Form submit failed, errors: ${JSON.stringify(errors, null, 2)}`)
                    },
                )}
                className="flex flex-col gap-3 max-w-prose"
            >
                <PatientTestField />
                <Button type="submit">Doit</Button>
            </form>
        </FormProvider>
    )
}

function PatientTestField(): ReactElement {
    const formContext = useFormContext<NySykmeldingFormValues>()
    const value = formContext.watch('pasient')

    const dataService = useNySykmeldingDataService()
    const { data, isLoading, error } = useQuery({
        queryKey: ['form', value?.length],
        queryFn: () => dataService.getPatient(),
        enabled: value?.length === 11,
    })

    return (
        <div>
            <TextField label="Test" placeholder="Passy" {...formContext.register('pasient')} />
            <div className="flex justify-center">
                <Detail>
                    Pasienten: {data?.fnr ?? 'N/A'}, {data?.navn ?? 'N/A'}
                </Detail>
                {isLoading && <Loader size="xsmall" />}
                {error && <Alert variant="error">Error: {error.message}</Alert>}
            </div>
        </div>
    )
}

export default NySykmeldingForm
