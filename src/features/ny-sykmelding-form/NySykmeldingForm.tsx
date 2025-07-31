import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'

import FormSection from '@components/form/form-section/FormSection'
import FormSheet from '@components/form/form-section/FormSheet'
import { ShortcutSubmitButton } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { DraftValues } from '@data-layer/draft/draft-schema'
import { nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { formValuesToStatePayload } from '@features/ny-sykmelding-form/form-mappers'

import type { NySykmeldingMainFormValues, NySykmeldingSuggestions } from './form'
import { useFormStep } from './steps/useFormStep'
import { createDefaultFormValues } from './form-default-values'
import BidiagnoseSection from './diagnose/bidiagnose/BidiagnoseSection'
import ArbeidsforholdSection from './arbeidsgiver/ArbeidsforholdSection'
import AndreSporsmalSection from './andre-sporsmal/AndreSporsmalSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import MeldingerSection from './meldinger/MeldingerSection'
import ForkastDraftButton, { LagreDraftButton } from './draft/DraftActions'
import FormDraftSync from './draft/FormDraftSync'
import styles from './NySykmeldingForm.module.css'

const FormDevTools = dynamic(() => import('@dev/tools/NySykmeldingFormDevTools'), { ssr: false })

type Props = {
    draftValues: DraftValues | null
    initialServerValues: NySykmeldingSuggestions
}

function NySykmeldingForm({ draftValues, initialServerValues }: Props): ReactElement {
    const initialValues = useAppSelector((state) => state.nySykmelding.values)
    const onSubmit = useHandleFormSubmit()
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues: createDefaultFormValues({
            draftValues: draftValues,
            valuesInState: initialValues,
            serverSuggestions: initialServerValues,
        }),
    })

    return (
        <FormProvider {...form}>
            <FormDraftSync />
            <form onSubmit={form.handleSubmit(onSubmit)} className={styles.formGrid}>
                <FormSheet className="row-span-3">
                    <FormSection title="Arbeidsgiver">
                        <ArbeidsforholdSection />
                    </FormSection>
                    <FormSection title="Periode">
                        <AktivitetSection />
                    </FormSection>
                    <DynamicTilbakedateringSection />
                </FormSheet>
                <FormSheet className="row-span-2">
                    <FormSection title="Diagnose">
                        <DiagnoseSection diagnosePrefillError={initialServerValues.diagnose.error} />
                        <BidiagnoseSection />
                    </FormSection>
                    <FormSection title="Andre spørsmål" hideTitle>
                        <AndreSporsmalSection />
                    </FormSection>
                    <FormSection title="Meldinger" hideBorder>
                        <MeldingerSection />
                    </FormSection>
                </FormSheet>
                <FormSheet className="flex items-end justify-end">
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

export default NySykmeldingForm
