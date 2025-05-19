import React, { ReactElement } from 'react'
import { DefaultValues, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@navikt/ds-react'
import { ArrowRightIcon } from '@navikt/aksel-icons'

import ExpandableFormSection from '@components/form/expandable-form-section/ExpandableFormSection'

import { useAppDispatch } from '../../providers/redux/hooks'
import { nySykmeldingMultistepActions } from '../../providers/redux/reducers/ny-sykmelding-multistep'

import { NySykmeldingMainFormValues } from './form'
import AktivitetSection from './aktivitet/AktivitetSection'
import DiagnoseSection from './diagnose/DiagnoseSection'
import { useFormStep } from './steps/useFormStep'
import MeldingerSection from './meldinger/MeldingerSection'

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
            }),
        )

        await setStep('summary')
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <ExpandableFormSection title="Sykmeldingsperiode">
                    <AktivitetSection />
                </ExpandableFormSection>
                <ExpandableFormSection title="Diagnose">
                    <DiagnoseSection />
                </ExpandableFormSection>
                <ExpandableFormSection title="Meldinger" defaultClosed>
                    <MeldingerSection />
                </ExpandableFormSection>
                <div className="w-full flex justify-end gap-3 mt-16">
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
        </FormProvider>
    )
}

function createDefaultValues(): DefaultValues<NySykmeldingMainFormValues> {
    return {}
}

export default MainSection
