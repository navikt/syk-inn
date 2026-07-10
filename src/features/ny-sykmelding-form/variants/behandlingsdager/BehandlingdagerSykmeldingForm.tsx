import { ArrowRightIcon } from '@navikt/aksel-icons'
import React, { ReactElement } from 'react'

import { FormSection } from '#components/form/form-section/FormSection'
import { FormSheet } from '#components/form/form-section/FormSheet'
import { TwoPaneGrid } from '#components/layout/TwoPaneGrid'
import { ShortcutSubmitButton } from '#components/shortcut/ShortcutButtons'
import { useMode } from '#core/providers/Modes'
import { useAppSelector } from '#core/redux/hooks'
import { AnnenFravarsgrunnField } from '#features/ny-sykmelding-form/sections/andre-sporsmal/AnnenFravarsgrunnField'
import { YrkesskadeField } from '#features/ny-sykmelding-form/sections/andre-sporsmal/YrkesskadeField'

import { ForkastDraftButtonInFormSync, LagreDraftButton } from '../../draft/DraftActions'
import { useFormContext } from '../../form/types'
import { NoActivePasientWarning } from '../../NoActivePasientWarning'
import { SvangerskapsrelatertField } from '../../sections/andre-sporsmal/SvangerskapsrelatertField'
import { BidiagnoseSection } from '../../sections/diagnose/bidiagnose/BidiagnoseSection'
import { DiagnoseInfoAlert } from '../../sections/diagnose/DiagnoseInfoAlert'
import { DiagnoseSection } from '../../sections/diagnose/DiagnoseSection'
import { MeldingTilArbeidsgiverField } from '../../sections/meldinger/MeldingTilArbeidsgiverField'
import { DynamicTilbakedateringSection } from '../../sections/tilbakedatering/DynamicTilbakedateringSection'
import { AllFormVariantsProps } from '../form-props'
import { useHandleFormSubmit } from '../useHandleFormSubmit'

import { BehandlingsdagerDescriptionField } from './BehandlingsdagerDescriptionField'
import { BehandlingsdagerPeriode } from './BehandlingsdagerPeriode'

export function BehandlingdagerSykmeldingForm({ initialFom, contextualErrors }: AllFormVariantsProps): ReactElement {
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
                <MeldingTilArbeidsgiverField />
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
                    <div className="mt-4">
                        <SvangerskapsrelatertField />
                        <AnnenFravarsgrunnField />
                    </div>
                </FormSection>
                <FormSection title="Vurderinger for Nav" hideBorder>
                    <div className="mb-4 -mt-2">
                        <YrkesskadeField />
                    </div>
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
