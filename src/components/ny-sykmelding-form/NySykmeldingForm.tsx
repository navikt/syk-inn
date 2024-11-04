'use client'

import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { logger } from '@navikt/next-logger'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'
import { DevTool } from '@hookform/devtools'
import { useMutation } from '@tanstack/react-query'
import { FloppydiskIcon, HandBandageIcon, PersonIcon, VitalsIcon } from '@navikt/aksel-icons'

import { FormSection } from '@components/ui/form'

import { useIsNySykmeldingDataServiceInitialized } from './data-provider/NySykmeldingFormDataProvider'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import PasientSection from './pasient/PasientSection'
import { NySykmeldingOpprettProgressModal } from './NySykmeldingOpprettProgressModal'
import FormErrors, { useFormErrors } from './errors/FormErrors'
import { NySykmeldingFormValues } from './NySykmeldingFormValues'
import { createSykmelding } from './ny-sykmelding-actions'

function NySykmeldingForm(): ReactElement {
    const [errorSectionRef, focusErrorSection] = useFormErrors()
    const form = useForm<NySykmeldingFormValues>()

    const opprettSykmelding = useMutation({
        mutationKey: ['opprett-sykmelding'],
        mutationFn: async (values: NySykmeldingFormValues) => {
            logger.info('(Client) Submitting values,', values)

            return await createSykmelding(values)
        },
        onSuccess: (data) => {
            if ('ok' in data) {
                logger.info('Sykmelding created successfully')
            } else {
                logger.error(`Sykmelding creation failed, errors: ${JSON.stringify(data)}`)
            }
        },
    })

    if (!useIsNySykmeldingDataServiceInitialized()) {
        return (
            <div className="max-w-prose p-8">
                <Alert variant="warning">Skjemaet er ikke tilgjengelig uten pasient-data.</Alert>
            </div>
        )
    }

    if (opprettSykmelding.data && 'ok' in opprettSykmelding.data) {
        return (
            <div className="flex flex-col gap-3 max-w-prose">
                <FormSection title="Takk for i dag">
                    <Alert variant="success" className="mt-4">
                        Sykmelding opprettet!
                    </Alert>
                </FormSection>
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
                    <FormSection
                        title="Info om pasienten"
                        icon={<PersonIcon />}
                        demoDescription="Info om pasienten vil enten være preutfylt via FHIR-context, eller så må det skrives inn for hånd. FHIR vil falle tilbake til manuell input dersom konteknsten er utilgjengelig."
                    >
                        <PasientSection />
                    </FormSection>

                    <FormSection
                        title="Diagnose"
                        icon={<HandBandageIcon />}
                        demoDescription="Et dynamisk søk i gyldige ICD-10 og ICPC-2 koder. Her er det rom for å begrense diagnosekoder til type behandler for eksempel."
                    >
                        <DiagnoseSection />
                    </FormSection>

                    <FormSection
                        title="Aktivitet"
                        icon={<VitalsIcon />}
                        demoDescription="Denne inputten er ikke avhengig av noe ekstern data, ren input med noe validering."
                        demoBottom
                    >
                        <AktivitetSection />
                    </FormSection>

                    <FormErrors ref={errorSectionRef} />

                    <FormSection
                        title="Oppsummering"
                        icon={<FloppydiskIcon />}
                        demoDescription="Kan vi mellomlagre informasjon for brukeren, så det ikke er noe fare for å miste data?"
                        demoBottom
                    >
                        <Heading level="3" size="small" spacing>
                            Ferdigstill sykmeldingen
                        </Heading>
                        <BodyShort spacing>
                            Du kan sende inn sykmeldingen til NAV, eller lagre den for å fortsette på et senere
                            tidspunkt.
                        </BodyShort>
                        <div className="flex gap-3 justify-end">
                            <Button type="submit" loading={opprettSykmelding.isPending}>
                                Opprett sykmelding
                            </Button>
                        </div>
                    </FormSection>
                </form>
                <DevTool control={form.control} placement="bottom-left" />
            </FormProvider>
            <NySykmeldingOpprettProgressModal isPending={opprettSykmelding.isPending} />
        </>
    )
}

export default NySykmeldingForm
