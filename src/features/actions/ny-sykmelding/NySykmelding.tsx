'use client'

import { useQuery } from '@apollo/client/react'
import React, { ReactElement } from 'react'

import { LoadablePageHeader } from '#components/layout/Page'
import { useAppSelector } from '#core/redux/hooks'
import NySykmeldingFormSkeleton from '#features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import NySykmeldingFormVariants from '#features/ny-sykmelding-form/NySykmeldingFormVariants'
import NySykmeldingPageSteps from '#features/ny-sykmelding-form/NySykmeldingPageSteps'
import { useDiagnoseSuggestions } from '#features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import { NySykmeldingFormVariantType, useFormVariant } from '#features/ny-sykmelding-form/useFormVariant'
import { PasientDocument } from '#queries'

import { nySykmeldingDefaultValues } from './ny-sykmelding-mappers'

export function NySykmeldingFormWithDefaultValues(): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)
    const pasient = useQuery(PasientDocument)
    const variant = useFormVariant()

    if (suggestionsQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton lead={getPageLead(variant)} />
    }

    const defaultValues = nySykmeldingDefaultValues(valuesInState, suggestionsQuery.suggestions, variant)

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead={getPageLead(variant)} value={pasient.data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormVariants
                variant={variant}
                defaultValues={defaultValues}
                context={{
                    utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
                }}
                contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            />
        </NySykmeldingPageSteps>
    )
}

function getPageLead(variant: NySykmeldingFormVariantType): string {
    switch (variant) {
        case 'NORMAL':
            return 'Sykmelding for'
        case 'REISETILSKUDD':
            return 'Sykmelding med reisetilskudd for'
        case 'BEHANDLINGSDAGER':
            return 'Sykemelding enkeltstående behandlingsdager for'
    }
}
