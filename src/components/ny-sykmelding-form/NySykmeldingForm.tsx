import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@navikt/ds-react'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'
import * as R from 'remeda'

import { raise } from '@utils/ts'
import AndreSporsmalSection from '@components/ny-sykmelding-form/andre-sporsmal/AndreSporsmalSection'
import { createDefaultValues } from '@components/ny-sykmelding-form/form-default-values'
import FormSection from '@components/form/form-section/FormSection'
import ForkastDraftButton, { LagreDraftButton } from '@components/ny-sykmelding-form/draft/DraftActions'
import FormSheet from '@components/form/form-section/FormSheet'
import ArbeidsforholdSection from '@components/ny-sykmelding-form/arbeidsgiver/ArbeidsforholdSection'

import { useAppDispatch, useAppSelector } from '../../providers/redux/hooks'
import { DraftValues } from '../../data-layer/draft/draft-schema'
import { AktivitetStep, nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import { AktivitetsPeriode, NySykmeldingMainFormValues, NySykmeldingSuggestions } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
import FormDraftSync from './draft/FormDraftSync'
import styles from './NySykmeldingForm.module.css'

const FormDevTools = dynamic(() => import('../../devtools/NySykmeldingFormDevTools'), { ssr: false })

type Props = {
    draftValues: DraftValues | null
    initialServerValues: NySykmeldingSuggestions
}

function NySykmeldingForm({ draftValues, initialServerValues }: Props): ReactElement {
    const initialValues = useAppSelector((state) => state.nySykmeldingMultistep)
    const onSubmit = useHandleFormSubmit()
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues: createDefaultValues({
            draftValues: draftValues,
            valuesInState: initialValues,
            serverSuggestions: initialServerValues,
        }),
    })

    return (
        <div className="bg-bg-default p-4 rounded">
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
                        </FormSection>
                        <FormSection title="Andre spørsmål" hideTitle>
                            <AndreSporsmalSection />
                        </FormSection>
                        <FormSection title="Meldinger" hideBorder>
                            <MeldingerSection />
                        </FormSection>
                    </FormSheet>
                    <FormSheet className="flex items-end justify-end">
                        <div className="flex gap-3">
                            <ForkastDraftButton />
                            <LagreDraftButton />
                            <Button
                                id="step-navigation-next"
                                type="submit"
                                variant="primary"
                                icon={<ArrowRightIcon aria-hidden />}
                                iconPosition="right"
                            >
                                Neste steg
                            </Button>
                        </div>
                    </FormSheet>
                </form>
                <FormDevTools />
            </FormProvider>
        </div>
    )
}

function useHandleFormSubmit() {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()

    return async (values: NySykmeldingMainFormValues): Promise<void> => {
        dispatch(
            nySykmeldingMultistepActions.completeMainStep({
                arbeidsforhold: {
                    harFlereArbeidsforhold: jaEllerNeiToBoolean(values.arbeidsforhold.harFlereArbeidsforhold),
                    sykmeldtFraArbeidsforhold: values.arbeidsforhold.sykmeldtFraArbeidsforhold,
                },
                diagnose: {
                    hoved: values.diagnoser.hoved ?? raise("Can't submit step without hoveddiagnose"),
                    bi: [],
                },
                aktiviteter: values.perioder.map(formAktivitetToStepAktivitet),
                tilbakedatering:
                    values.tilbakedatering?.fom && values.tilbakedatering?.grunn
                        ? {
                              fom: values.tilbakedatering.fom,
                              grunn: values.tilbakedatering.grunn,
                          }
                        : null,
                meldinger: {
                    showTilNav: values.meldinger.showTilNav,
                    showTilArbeidsgiver: values.meldinger.showTilArbeidsgiver,
                    tilNav: values.meldinger.tilNav,
                    tilArbeidsgiver: values.meldinger.tilArbeidsgiver,
                },
                andreSporsmal: {
                    svangerskapsrelatert: values.andreSporsmal.includes('svangerskapsrelatert'),
                    yrkesskade: values.andreSporsmal.includes('yrkesskade'),
                },
            }),
        )

        await setStep('summary')
    }
}

function jaEllerNeiToBoolean(value: 'JA' | 'NEI' | null): boolean {
    if (value === null) raise('Value cannot be null')
    return value === 'JA'
}

function formAktivitetToStepAktivitet(value: AktivitetsPeriode): AktivitetStep {
    switch (value.aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.periode.fom ?? raise('FOM is required for AKTIVITET_IKKE_MULIG'),
                tom: value.periode.tom ?? raise('TOM is required for AKTIVITET_IKKE_MULIG'),
            }
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.periode.fom ?? raise('FOM is required for GRADERT'),
                tom: value.periode.tom ?? raise('TOM is required for GRADERT'),
                grad: R.isNumber(Number(value.aktivitet.grad))
                    ? Number(value.aktivitet.grad)
                    : raise('Grad is required for GRADERT'),
            }
    }
}

export default NySykmeldingForm
