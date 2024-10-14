'use client'

import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { logger } from '@navikt/next-logger'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'
import { DevTool } from '@hookform/devtools'
import { useMutation } from '@tanstack/react-query'

import PasientSection from '@components/ny-sykmelding/pasient/PasientSection'
import { FormSection } from '@components/ui/form'
import ArbeidssituasjonSection from '@components/ny-sykmelding/arbeidssituasjon/ArbeidssituasjonSection'
import DiagnoseSection from '@components/ny-sykmelding/diagnose/DiagnoseSection'
import FormErrors, { useFormErrors } from '@components/ny-sykmelding/errors/FormErrors'

import { useIsNySykmeldingDataServiceInitialized } from './data-provider/NySykmeldingFormDataProvider'
import { NySykmeldingFormValues } from './NySykmeldingFormValues'
import { NySykmeldingOpprettProgressModal } from './NySykmeldingOpprettProgressModal'

function NySykmeldingForm(): ReactElement {
    const [errorSectionRef, focusErrorSection] = useFormErrors()
    const form = useForm<NySykmeldingFormValues>()

    const opprettSykmelding = useMutation({
        mutationKey: ['opprett-sykmelding'],
        mutationFn: async (values: NySykmeldingFormValues) => {
            logger.info('Submitting values,', values)
            await new Promise((resolve) => setTimeout(resolve, 10000))
            return { TODO: true }
        },
    })

    if (!useIsNySykmeldingDataServiceInitialized()) {
        return (
            <div className="max-w-prose p-8">
                <Alert variant="warning">Skjemaet er ikke tilgjengelig uten pasient-data.</Alert>
            </div>
        )
    }

    return (
        <>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(
                        (values) => {
                            logger.info(`Form submit OK, values: ${JSON.stringify(values, null, 2)}`)
                            opprettSykmelding.mutate(values)
                        },
                        (errors) => {
                            logger.error(`Form submit failed, errors:`)
                            logger.info(errors)

                            focusErrorSection()
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

                    <FormErrors ref={errorSectionRef} />

                    <div className="bg-bg-subtle p-4 rounded">
                        <Heading level="3" size="medium" spacing>
                            Ferdigstill sykmeldingen
                        </Heading>
                        <BodyShort spacing>
                            Du kan sende inn sykmeldingen til NAV, eller lagre den for å fortsette på et senere
                            tidspunkt.
                        </BodyShort>
                        <div className="flex gap-3 justify-end">
                            <Button type="button" variant="secondary" loading={opprettSykmelding.isPending}>
                                Lagre
                            </Button>
                            <Button type="submit" loading={opprettSykmelding.isPending}>
                                Opprett sykmelding
                            </Button>
                        </div>
                    </div>
                </form>
                <DevTool control={form.control} placement="bottom-left" />
            </FormProvider>
            <NySykmeldingOpprettProgressModal isPending={opprettSykmelding.isPending} />
        </>
    )
}

export default NySykmeldingForm
