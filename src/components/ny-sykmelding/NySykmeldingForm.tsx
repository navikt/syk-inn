'use client'

import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { logger } from '@navikt/next-logger'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'
import { DevTool } from '@hookform/devtools'

import { useIsNySykmeldingDataServiceInitialized } from '@components/ny-sykmelding/data-provider/NySykmeldingFormDataProvider'
import { NySykmeldingFormValues } from '@components/ny-sykmelding/NySykmeldingFormValues'
import PasientSection from '@components/ny-sykmelding/pasient/PasientSection'
import { FormSection } from '@components/ui/form'
import ArbeidssituasjonSection from '@components/ny-sykmelding/arbeidssituasjon/ArbeidssituasjonSection'
import DiagnoseSection from '@components/ny-sykmelding/diagnose/DiagnoseSection'

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
                <FormSection title="Info om pasienten">
                    <PasientSection />
                </FormSection>

                <FormSection title="Arbeidssituasjon">
                    <ArbeidssituasjonSection />
                </FormSection>

                <FormSection title="Diagnose">
                    <DiagnoseSection />
                </FormSection>

                <div className="bg-bg-subtle p-4 rounded">
                    <Heading level="3" size="medium" spacing>
                        Ferdigstill sykmeldingen
                    </Heading>
                    <BodyShort spacing>
                        Du kan sende inn sykmeldingen til NAV, eller lagre den for å fortsette på et senere tidspunkt.
                    </BodyShort>
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="secondary">
                            Lagre
                        </Button>
                        <Button type="submit">Opprett sykmelding</Button>
                    </div>
                </div>
            </form>
            <DevTool control={form.control} placement="bottom-left" />
        </FormProvider>
    )
}

export default NySykmeldingForm
