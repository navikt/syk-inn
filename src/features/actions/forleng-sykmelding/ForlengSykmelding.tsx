'use client'

import { useQuery } from '@apollo/client/react'
import React, { ReactElement } from 'react'

import { LoadablePageHeader } from '#components/layout/Page'
import { useAppSelector } from '#core/redux/hooks'
import { NySykmeldingFormSkeleton } from '#features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { NySykmeldingFormVariants } from '#features/ny-sykmelding-form/NySykmeldingFormVariants'
import { NySykmeldingPageSteps } from '#features/ny-sykmelding-form/NySykmeldingPageSteps'
import { useDiagnoseSuggestions } from '#features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import { inferSykmeldingType } from '#features/ny-sykmelding-form/useFormVariant'
import { PasientDocument, SykmeldingByIdDocument } from '#queries'

import { SykmeldingFormErrors } from '../common/SykmeldingFormErrors'

import { forlengSykmeldingDefaultValues } from './forleng-sykmelding-mappers'

interface Props {
    sykmeldingId: string
}

export function ForlengSykmeldingFormWithDefaultValues({ sykmeldingId }: Props): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })
    const pasient = useQuery(PasientDocument)
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)

    if (suggestionsQuery.loading || sykmeldingQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton lead="Forleng sykmelding for" />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const variantToBeForlenged = inferSykmeldingType(sykmeldingQuery.data.sykmelding)
    const [derivedDefaultValues, nextFom] = forlengSykmeldingDefaultValues(
        sykmeldingQuery.data.sykmelding,
        valuesInState,
        variantToBeForlenged,
    )

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Forleng sykmelding for" value={pasient.data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormVariants
                variant={variantToBeForlenged}
                defaultValues={derivedDefaultValues}
                context={{
                    utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
                }}
                contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
                initialFom={nextFom}
            />
        </NySykmeldingPageSteps>
    )
}
