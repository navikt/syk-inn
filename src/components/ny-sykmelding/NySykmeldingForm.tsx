'use client'

import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { logger } from '@navikt/next-logger'
import { Alert, Button } from '@navikt/ds-react'

import { useIsNySykmeldingDataServiceInitialized } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { NySykmeldingFormValues } from '@components/ny-sykmelding/NySykmeldingFormValues'
import PasientSection from '@components/ny-sykmelding/pasient/PasientSection'

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
                <PasientSection />
                <Button type="submit">Doit</Button>
            </form>
        </FormProvider>
    )
}

export default NySykmeldingForm
