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
import { useMode } from '@core/providers/Modes'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'

import { formValuesToStatePayload } from './form/form-to-state'
import { UtdypendeSporsmal } from './utfyllende-sporsmal/UtdypendeendeSporsmal'
import { NySykmeldingMainFormValues, useFormContext } from './form/types'
import { useFormStep } from './steps/useFormStep'
import DiagnoseSection from './diagnose/DiagnoseSection'
import DiagnoseInfoAlert from './diagnose/DiagnoseInfoAlert'
import BidiagnoseSection from './diagnose/bidiagnose/BidiagnoseSection'
import ArbeidsforholdSection from './arbeidsgiver/ArbeidsforholdSection'
import AndreSporsmalSection from './andre-sporsmal/AndreSporsmalSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
import AktivitetSection from './aktivitet/AktivitetSection'
import MeldingerSection from './meldinger/MeldingerSection'
import { ForkastDraftButtonInFormSync, LagreDraftButton } from './draft/DraftActions'
import { FormDraftSync, useFormDraftSync } from './draft/FormDraftSync'
import styles from './NySykmeldingForm.module.css'

const FormDevTools = dynamic(() => import('@dev/tools/NySykmeldingFormDevTools'), { ssr: false })

type NySykmeldingFormProps = {
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
        utdypendeSporsmal?: UtdypendeOpplysningerHint | null
        initialFom?: string
    }
    /**
     * Used for contexctually relevant error messages
     */
    contextualErrors: {
        diagnose?: { error: 'FHIR_FAILED' }
    }
}

function NySykmeldingForm({
    defaultValues,
    initialFom,
    context,
    contextualErrors,
}: NySykmeldingFormProps): ReactElement {
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues,
    })

    return (
        <FormProvider {...form}>
            <FormDraftSync>
                <NySykmeldingInnerForm initialFom={initialFom} context={context} contextualErrors={contextualErrors} />
            </FormDraftSync>
            <FormDevTools />
        </FormProvider>
    )
}

/**
 * The submit handler needs to exist in the FormDraftSync scope, as it needs to flush any pending
 * draft syncs when submitting, thus this seemingly unnecessary split.
 */
function NySykmeldingInnerForm({
    initialFom,
    context,
    contextualErrors,
}: Omit<NySykmeldingFormProps, 'defaultValues'>): ReactElement {
    const mode = useMode()
    const form = useFormContext()
    const selectedPasient = useAppSelector((state) => state.nySykmelding.pasient)
    const onSubmit = useHandleFormSubmit()

    return (
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
                    <DiagnoseSection diagnosePrefillError={contextualErrors.diagnose} />
                    <BidiagnoseSection />
                    {mode.type === 'FHIR' && <DiagnoseInfoAlert />}
                </FormSection>
                <UtdypendeSporsmal utdypendeSporsmal={context.utdypendeSporsmal} />
                <FormSection title="Andre spørsmål" hideTitle>
                    <AndreSporsmalSection />
                </FormSection>
                <FormSection title="Meldinger" hideBorder>
                    <MeldingerSection />
                </FormSection>
                <div className="flex gap-3 p-2">
                    <ForkastDraftButtonInFormSync />
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
                        loading={form.formState.isSubmitting}
                    >
                        Neste steg
                    </ShortcutSubmitButton>
                </div>
            </FormSheet>
        </form>
    )
}

function useHandleFormSubmit() {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()
    const draftSync = useFormDraftSync()

    return async (values: NySykmeldingMainFormValues): Promise<void> => {
        dispatch(nySykmeldingActions.completeForm(formValuesToStatePayload(values)))

        await draftSync.saveDraft()
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
