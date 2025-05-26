import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@navikt/ds-react'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'

import { raise } from '@utils/ts'
import ExpandableFormSection from '@components/form/expandable-form-section/ExpandableFormSection'
import AndreSporsmalSection from '@components/ny-sykmelding-form/andre-sporsmal/AndreSporsmalSection'
import { createDefaultValues } from '@components/ny-sykmelding-form/form-default-values'

import { useAppDispatch, useAppSelector } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import { NySykmeldingMainFormValues, NySykmeldingSuggestions } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'

const FormDevTools = dynamic(() => import('../../devtools/NySykmeldingFormDevTools'), { ssr: false })

type Props = {
    initialServerValues: NySykmeldingSuggestions
}

function MainSection({ initialServerValues }: Props): ReactElement {
    const initialValues = useAppSelector((state) => state.nySykmeldingMultistep)
    const onSubmit = useHandleFormSubmit()
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues: createDefaultValues({
            initialValues,
            initialSuggestions: initialServerValues,
        }),
    })

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ExpandableFormSection title="Sykmeldingsperiode" className="lg:col-span-2">
                    <AktivitetSection />
                </ExpandableFormSection>
                <DynamicTilbakedateringSection />
                <ExpandableFormSection title="Diagnose">
                    <DiagnoseSection diagnosePrefillError={initialServerValues.diagnose.error} />
                </ExpandableFormSection>
                <ExpandableFormSection title="Andre spørsmål">
                    <AndreSporsmalSection />
                </ExpandableFormSection>
                <ExpandableFormSection
                    title="Meldinger"
                    defaultClosed={
                        initialValues.meldinger?.tilNav == null && initialValues.meldinger?.tilArbeidsgiver == null
                    }
                    className="lg:col-span-2"
                >
                    <MeldingerSection />
                </ExpandableFormSection>
                <div className="w-full flex justify-end gap-3 mt-16 lg:col-span-2">
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
            nySykmeldingMultistepActions.completeMainStep({
                diagnose: {
                    hoved: values.diagnoser.hoved ?? raise("Can't submit step without hoveddiagnose"),
                    bi: [],
                },
                aktiviteter: values.perioder.map((periode) => ({
                    fom: periode.periode.fom,
                    tom: periode.periode.tom,
                    grad: periode.aktivitet.grad,
                    type: periode.aktivitet.type,
                })),
                tilbakedatering: values.tilbakedatering
                    ? {
                          fom: values.tilbakedatering?.fom ?? '',
                          grunn: values.tilbakedatering?.grunn ?? '',
                      }
                    : null,
                meldinger: {
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

export default MainSection
