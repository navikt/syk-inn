import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'
import * as R from 'remeda'

import { raise } from '@lib/ts'
import FormSection from '@components/form/form-section/FormSection'
import FormSheet from '@components/form/form-section/FormSheet'
import { ShortcutSubmitButton } from '@components/shortcut/ShortcutButtons'
import { useAppDispatch, useAppSelector } from '@core/redux/hooks'
import { DraftValues } from '@data-layer/draft/draft-schema'
import { NySykmeldingAktivitet, nySykmeldingActions } from '@core/redux/reducers/ny-sykmelding'
import { Diagnose } from '@data-layer/common/diagnose'

import BidiagnoseSection from './diagnose/bidiagnose/BidiagnoseSection'
import ArbeidsforholdSection from './arbeidsgiver/ArbeidsforholdSection'
import ForkastDraftButton, { LagreDraftButton } from './draft/DraftActions'
import { createDefaultFormValues } from './form-default-values'
import AndreSporsmalSection from './andre-sporsmal/AndreSporsmalSection'
import { AktivitetsPeriode, NySykmeldingMainFormValues, NySykmeldingSuggestions } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
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
        dispatch(
            nySykmeldingActions.completeForm({
                arbeidsforhold: {
                    harFlereArbeidsforhold: jaEllerNeiToBoolean(values.arbeidsforhold.harFlereArbeidsforhold),
                    sykmeldtFraArbeidsforhold: values.arbeidsforhold.sykmeldtFraArbeidsforhold,
                },
                diagnose: {
                    hoved: values.diagnoser.hoved ?? raise("Can't submit step without hoveddiagnose"),
                    bi: values.diagnoser.bidiagnoser.filter((it): it is Diagnose => {
                        if (it == null) {
                            raise("Can't submit step with null bidiagnose")
                        }
                        return true
                    }),
                },
                aktiviteter: values.perioder.map(formAktivitetToStepAktivitet),
                tilbakedatering:
                    values.tilbakedatering?.fom && values.tilbakedatering?.grunn
                        ? {
                              fom: values.tilbakedatering.fom,
                              grunn: values.tilbakedatering.grunn,
                              annenGrunn: values.tilbakedatering.annenGrunn ?? null,
                          }
                        : null,
                meldinger: {
                    showTilNav: values.meldinger.showTilNav,
                    showTilArbeidsgiver: values.meldinger.showTilArbeidsgiver,
                    tilNav: values.meldinger.tilNav,
                    tilArbeidsgiver: values.meldinger.tilArbeidsgiver,
                },
                andreSporsmal: {
                    svangerskapsrelatert: values.andreSporsmal.svangerskapsrelatert,
                    yrkesskade: values.andreSporsmal.yrkesskade?.yrkesskade ?? false,
                    yrkesskadeDato: values.andreSporsmal.yrkesskade?.skadedato ?? null,
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

function formAktivitetToStepAktivitet(value: AktivitetsPeriode): NySykmeldingAktivitet {
    switch (value.aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.periode.fom ?? raise('FOM is required for AKTIVITET_IKKE_MULIG'),
                tom: value.periode.tom ?? raise('TOM is required for AKTIVITET_IKKE_MULIG'),
                medisinskArsak: {
                    isMedisinskArsak: value.medisinskArsak?.isMedisinskArsak ?? null,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: value.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: value.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? null,
                    annenArbeidsrelatertArsak: value.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
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
