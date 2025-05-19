import React, { ReactElement } from 'react'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@navikt/ds-react'
import { ArrowRightIcon } from '@navikt/aksel-icons'
import dynamic from 'next/dynamic'

import ExpandableFormSection from '@components/form/expandable-form-section/ExpandableFormSection'
import AndreSporsmalSection from '@components/ny-sykmelding-form/andre-sporsmal/AndreSporsmalSection'

import { useAppDispatch } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import { NySykmeldingMainFormValues } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'

const FormDevTools = dynamic(() => import('../../devtools/NySykmeldingFormDevTools'), { ssr: false })

function MainSection(): ReactElement {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()
    const form = useForm<NySykmeldingMainFormValues>({
        defaultValues: createDefaultValues(),
    })

    const onSubmit = async (values: NySykmeldingMainFormValues): Promise<void> => {
        dispatch(
            nySykmeldingMultistepActions.completeMainStep({
                diagnose: {
                    hoved: values.diagnoser.hoved,
                    bi: [],
                },
                aktivitet: {
                    // TODO: This is garbage, refactor when we implement multi-periode support
                    fom: values.perioder[0].periode.fom,
                    tom: values.perioder[0].periode.tom,
                    grad: values.perioder[0].aktivitet.grad,
                    type: values.perioder[0].aktivitet.type,
                },
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

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ExpandableFormSection title="Sykmeldingsperiode" className="lg:col-span-2">
                    <AktivitetSection />
                </ExpandableFormSection>
                <ExpandableFormSection title="Diagnose">
                    <DiagnoseSection />
                </ExpandableFormSection>
                <ExpandableFormSection title="Andre sporsmal">
                    <AndreSporsmalSection />
                </ExpandableFormSection>
                <ExpandableFormSection title="Meldinger" defaultClosed className="lg:col-span-2">
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

function createDefaultValues(): DefaultValues<NySykmeldingMainFormValues> {
    return {
        meldinger: {
            tilNav: null,
            tilArbeidsgiver: null,
        },
        andreSporsmal: [],
    }
}

export default MainSection
