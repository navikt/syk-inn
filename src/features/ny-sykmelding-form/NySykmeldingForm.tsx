import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'

import FormSection from '@components/form/form-section/FormSection'
import FormSheet from '@components/form/form-section/FormSheet'
import { ShortcutSubmitButton } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { UtdypendeSporsmal } from '@features/ny-sykmelding-form/utfyllende-sporsmal/UtdypendeendeSporsmal'
import { SykmeldingDateRange } from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'

import type { NySykmeldingMainFormValues } from './form'
import { formValuesToStatePayload } from './form-mappers'
import { useFormStep } from './steps/useFormStep'
import DiagnoseSection from './diagnose/DiagnoseSection'
import DiagnoseInfoAlert from './diagnose/DiagnoseInfoAlert'
import BidiagnoseSection from './diagnose/bidiagnose/BidiagnoseSection'
import ArbeidsforholdSection from './arbeidsgiver/ArbeidsforholdSection'
import AndreSporsmalSection from './andre-sporsmal/AndreSporsmalSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
import AktivitetSection from './aktivitet/AktivitetSection'
import MeldingerSection from './meldinger/MeldingerSection'
import ForkastDraftButton, { LagreDraftButton } from './draft/DraftActions'
import FormDraftSync from './draft/FormDraftSync'
import styles from './NySykmeldingForm.module.css'

const FormDevTools = dynamic(() => import('@dev/tools/NySykmeldingFormDevTools'), { ssr: false })

type Props = {
    /**
     * Any form rendered NEEDS to come provided with default values. The form can be rendered in different
     * contexts, some that care about existing values/drafts/suggestions differently. This should be controlled
     * by the parent.
     */
    defaultValues: NySykmeldingMainFormValues
    /**
     * When for example forlenging a sykmelding, we need to know the last day+1 from the
     * sykmelding we are forlenging.
     */
    initialFom?: string
    context: {
        initialFom?: string
        previousSykmeldingDateRange?: SykmeldingDateRange[]
    }
    /**
     * Used for contexctually relevant error messages
     */
    contextualErrors: {
        diagnose?: { error: 'FHIR_FAILED' }
    }
}

function NySykmeldingForm({ defaultValues, initialFom, context, contextualErrors }: Props): ReactElement {
    const selectedPasient = useAppSelector((state) => state.nySykmelding.pasient)
    const onSubmit = useHandleFormSubmit()
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues,
    })

    return (
        <FormProvider {...form}>
            <FormDraftSync />
            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.formGrid}>
                <FormSheet className="row-span-3 relative">
                    {selectedPasient == null && <NoActivePasientWarning />}
                    <FormSection title="Arbeidsgiver">
                        <ArbeidsforholdSection />
                    </FormSection>
                    <AktivitetSection initialFom={initialFom ?? null} />
                    <DynamicTilbakedateringSection />
                    <div className="bg-surface-subtle w-4 h-[calc(100%-2rem)] absolute -right-4 rounded" />
                </FormSheet>
                <FormSheet className="row-span-2">
                    <FormSection title="Diagnose">
                        <DiagnoseSection diagnosePrefillError={contextualErrors?.diagnose} />
                        <BidiagnoseSection />
                        <DiagnoseInfoAlert />
                    </FormSection>
                    <UtdypendeSporsmal previousSykmeldingDateRange={context.previousSykmeldingDateRange} />
                    <FormSection title="Andre spørsmål" hideTitle>
                        <AndreSporsmalSection />
                    </FormSection>
                    <FormSection title="Meldinger" hideBorder>
                        <MeldingerSection />
                    </FormSection>
                    <div className="flex gap-3 p-2">
                        <ForkastDraftButton />
                        <LagreDraftButton />
                        <ShortcutSubmitButton
                            id="step-navigation-next"
                            variant="primary"
                            icon={<ArrowRightIcon aria-hidden />}
                            iconPosition="right"
                            shortcut={{
                                modifier: 'alt',
                                key: 'n',
                            }}
                            disabled={selectedPasient == null}
                        >
                            Neste steg
                        </ShortcutSubmitButton>
                    </div>
                </FormSheet>
            </form>
            <FormDevTools />
        </FormProvider>
    )
}

function useHandleFormSubmit() {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()

    return async (values: NySykmeldingMainFormValues): Promise<void> => {
        dispatch(nySykmeldingActions.completeForm(formValuesToStatePayload(values)))

        await setStep('summary')
    }
}

function NoActivePasientWarning(): ReactElement {
    return (
        <div>
            <Alert variant="warning">
                <Heading level="2" size="small" spacing>
                    Ingen pasient er valgt
                </Heading>
                <BodyShort spacing>
                    Det har skjedd en feil under oppstart av sykmeldingsskjemaet. Dette skal ikke skje.
                </BodyShort>
                <BodyShort spacing>
                    Prøv å start skjemaet på nytt, eller kontakt support dersom feilen vedvarer.
                </BodyShort>
            </Alert>
        </div>
    )
}

export default NySykmeldingForm
