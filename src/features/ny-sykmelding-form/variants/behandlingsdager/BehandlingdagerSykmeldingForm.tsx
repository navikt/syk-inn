import React, { ReactElement } from 'react'
import { ArrowRightIcon } from '@navikt/aksel-icons'

import FormSheet from '@components/form/form-section/FormSheet'
import { NoActivePasientWarning } from '@features/ny-sykmelding-form/NoActivePasientWarning'
import FormSection from '@components/form/form-section/FormSection'
import DynamicTilbakedateringSection from '@features/ny-sykmelding-form/sections/tilbakedatering/DynamicTilbakedateringSection'
import DiagnoseSection from '@features/ny-sykmelding-form/sections/diagnose/DiagnoseSection'
import BidiagnoseSection from '@features/ny-sykmelding-form/sections/diagnose/bidiagnose/BidiagnoseSection'
import DiagnoseInfoAlert from '@features/ny-sykmelding-form/sections/diagnose/DiagnoseInfoAlert'
import AndreSporsmalSection from '@features/ny-sykmelding-form/sections/andre-sporsmal/AndreSporsmalSection'
import { ForkastDraftButtonInFormSync, LagreDraftButton } from '@features/ny-sykmelding-form/draft/DraftActions'
import { ShortcutSubmitButton } from '@components/shortcut/ShortcutButtons'
import { useMode } from '@core/providers/Modes'
import { useFormContext } from '@features/ny-sykmelding-form/form/types'
import { useAppSelector } from '@core/redux/hooks'
import TwoPaneGrid from '@components/layout/TwoPaneGrid'
import MeldingTilArbeidsgiverField from '@features/ny-sykmelding-form/sections/meldinger/MeldingTilArbeidsgiverField'

import { AllFormVariantsProps } from '../form-props'
import { useHandleFormSubmit } from '../useHandleFormSubmit'

import BehandlingsdagerDescriptionField from './BehandlingsdagerDescriptionField'
import BehandlingsdagerPeriode from './BehandlingsdagerPeriode'

function BehandlingdagerSykmeldingForm({ initialFom, contextualErrors }: AllFormVariantsProps): ReactElement {
    const mode = useMode()
    const form = useFormContext()
    const onSubmit = useHandleFormSubmit()
    const selectedPasient = useAppSelector((state) => state.nySykmelding.pasient)

    return (
        <TwoPaneGrid tag="form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormSheet className="relative">
                {!selectedPasient && <NoActivePasientWarning />}
                <FormSection title="Periode for enkeltstående behandlingsdager">
                    <BehandlingsdagerPeriode initialFom={initialFom ?? null} />
                </FormSection>
                <BehandlingsdagerDescriptionField />
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
                <FormSection title="Andre spørsmål" hideTitle>
                    <AndreSporsmalSection />
                </FormSection>
                <FormSection title="Meldinger" hideBorder hideTitle>
                    <MeldingTilArbeidsgiverField />
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

export default BehandlingdagerSykmeldingForm
