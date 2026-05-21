import React, { ReactElement } from 'react'
import { ArrowRightIcon } from '@navikt/aksel-icons'

import { useMode } from '@core/providers/Modes'
import TwoPaneGrid from '@components/layout/TwoPaneGrid'
import FormSheet from '@components/form/form-section/FormSheet'
import FormSection from '@components/form/form-section/FormSection'
import { ShortcutSubmitButton } from '@components/shortcut/ShortcutButtons'
import { UtdypendeOpplysningerHint } from '@resolvers'
import { useAppSelector } from '@core/redux/hooks'

import { NoActivePasientWarning } from '../../NoActivePasientWarning'
import { useFormContext } from '../../form/types'
import ArbeidsforholdSection from '../../sections/arbeidsgiver/ArbeidsforholdSection'
import AktivitetSection from '../../sections/aktivitet/AktivitetSection'
import DynamicTilbakedateringSection from '../../sections/tilbakedatering/DynamicTilbakedateringSection'
import DiagnoseSection from '../../sections/diagnose/DiagnoseSection'
import BidiagnoseSection from '../../sections/diagnose/bidiagnose/BidiagnoseSection'
import DiagnoseInfoAlert from '../../sections/diagnose/DiagnoseInfoAlert'
import { UtdypendeSporsmal } from '../../sections/utfyllende-sporsmal/UtdypendeendeSporsmal'
import AndreSporsmalSection from '../../sections/andre-sporsmal/AndreSporsmalSection'
import MeldingerSection from '../../sections/meldinger/MeldingerSection'
import { ForkastDraftButtonInFormSync, LagreDraftButton } from '../../draft/DraftActions'
import { useHandleFormSubmit } from '../useHandleFormSubmit'
import { AllFormVariantsProps } from '../form-props'

export type NormalSykmeldingFormProps = {
    context: {
        utdypendeSporsmal?: UtdypendeOpplysningerHint | null
    }
}

/**
 * The submit handler needs to exist in the FormDraftSync scope, as it needs to flush any pending
 * draft syncs when submitting, thus this seemingly unnecessary split.
 */
export function NormalSykmeldigForm({
    initialFom,
    context,
    contextualErrors,
}: AllFormVariantsProps & NormalSykmeldingFormProps): ReactElement {
    const mode = useMode()
    const form = useFormContext()
    const onSubmit = useHandleFormSubmit()
    const selectedPasient = useAppSelector((state) => state.nySykmelding.pasient)

    return (
        <TwoPaneGrid tag="form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormSheet className="relative">
                {!selectedPasient && <NoActivePasientWarning />}
                <FormSection title="Arbeidsgiver" hideTitle>
                    <ArbeidsforholdSection />
                </FormSection>
                <AktivitetSection initialFom={initialFom ?? null} />
                <DynamicTilbakedateringSection />
                <div className="bg-ax-bg-neutral-soft w-4 h-[calc(100%-2rem)] absolute -right-6 rounded hidden ax-lg:block" />
            </FormSheet>
            <FormSheet>
                <FormSection
                    title="Diagnose"
                    className="border-t border-t-ax-border-neutral-subtle pt-3 ax-lg:pt-0 ax-lg:border-none"
                >
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
                <div className="flex flex-row flex-wrap ax-md:grid-cols-3 gap-3 p-2 ax-lg:justify-end">
                    <ForkastDraftButtonInFormSync className="flex-grow ax-md:max-w-46" />
                    <LagreDraftButton className="flex-grow ax-md:max-w-46" />
                    <ShortcutSubmitButton
                        className="flex-grow ax-md:max-w-46"
                        id="step-navigation-next"
                        variant="primary"
                        icon={<ArrowRightIcon aria-hidden />}
                        iconPosition="right"
                        shortcut={{
                            modifier: 'alt',
                            code: 'KeyN',
                        }}
                        disabled={selectedPasient == null}
                        loading={form.formState.isSubmitting}
                    >
                        Neste steg
                    </ShortcutSubmitButton>
                </div>
            </FormSheet>
        </TwoPaneGrid>
    )
}
