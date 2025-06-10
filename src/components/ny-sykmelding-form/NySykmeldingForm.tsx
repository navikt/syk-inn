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

import { useAppDispatch, useAppSelector } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'
import { DraftValues } from '../../data-layer/draft/draft-schema'

import { NySykmeldingMainFormValues, NySykmeldingSuggestions } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'
import DynamicTilbakedateringSection from './tilbakedatering/DynamicTilbakedateringSection'
import FormDraftSync from './draft/FormDraftSync'

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
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormSection title="Periode">
                        <AktivitetSection />
                    </FormSection>
                    <DynamicTilbakedateringSection />
                    <FormSection title="Diagnose" className="mt-8">
                        <DiagnoseSection diagnosePrefillError={initialServerValues.diagnose.error} />
                    </FormSection>
                    <FormSection title="Andre spørsmål" className="my-8" hideTitle>
                        <AndreSporsmalSection />
                    </FormSection>
                    <FormSection title="Meldinger" className="mt-8">
                        <MeldingerSection />
                    </FormSection>
                    <div className="w-full flex justify-end gap-3 mt-16 lg:col-span-2">
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
                diagnose: {
                    hoved: values.diagnoser.hoved ?? raise("Can't submit step without hoveddiagnose"),
                    bi: [],
                },
                aktiviteter: values.perioder.map((periode) => ({
                    fom: periode.periode.fom ?? raise("Can't submit step without periode fom"),
                    tom: periode.periode.tom ?? raise("Can't submit step without periode tom"),
                    grad:
                        periode.aktivitet.grad != null && R.isNumber(Number(periode.aktivitet.grad))
                            ? Number(periode.aktivitet.grad)
                            : null,
                    type: periode.aktivitet.type,
                })),
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

export default NySykmeldingForm
