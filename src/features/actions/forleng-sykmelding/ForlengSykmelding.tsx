'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import NySykmeldingFormVariants from '@features/ny-sykmelding-form/NySykmeldingFormVariants'
import { useAppSelector } from '@core/redux/hooks'
import { inferSykmeldingType } from '@features/ny-sykmelding-form/useFormVariant'

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
        return <NySykmeldingFormSkeleton />
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
        <NySykmeldingFormVariants
            variant={variantToBeForlenged}
            defaultValues={derivedDefaultValues}
            context={{
                utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
            }}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            initialFom={nextFom}
        />
    )
}
