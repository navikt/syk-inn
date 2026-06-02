'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { inferSykmeldingType } from '@features/ny-sykmelding-form/useFormVariant'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/sections/diagnose/useDiagnoseSuggestions'
import NySykmeldingFormVariants from '@features/ny-sykmelding-form/NySykmeldingFormVariants'
import { useAppSelector } from '@core/redux/hooks'
import { LoadablePageHeader } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'

import { SykmeldingFormErrors } from '../common/SykmeldingFormErrors'

import { dupliserSykmeldingDefaultValues } from './dupliser-sykmelding-mapper'

interface Props {
    sykmeldingId: string
}

export function DupliserSykmeldingFormWithDefaultValues({ sykmeldingId }: Props): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })
    const pasient = useQuery(PasientDocument)
    const valuesInState = useAppSelector((state) => state.nySykmelding.values)

    if (suggestionsQuery.loading || sykmeldingQuery.loading || pasient.loading) {
        return <NySykmeldingFormSkeleton lead="Dupliser sykmelding for" />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const variantToBeDuplisert = inferSykmeldingType(sykmeldingQuery.data.sykmelding)
    const derivedDefaultValues = dupliserSykmeldingDefaultValues(
        sykmeldingQuery.data.sykmelding,
        valuesInState,
        variantToBeDuplisert,
    )

    return (
        <NySykmeldingPageSteps
            heading={<LoadablePageHeader lead="Dupliser sykmelding for" value={pasient.data?.pasient?.navn ?? null} />}
        >
            <NySykmeldingFormVariants
                variant={variantToBeDuplisert}
                defaultValues={derivedDefaultValues}
                context={{
                    utdypendeSporsmal: pasient.data?.pasient?.utdypendeSporsmal,
                }}
                contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            />
        </NySykmeldingPageSteps>
    )
}
