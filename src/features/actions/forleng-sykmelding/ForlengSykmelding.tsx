'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import { PasientDocument, SykmeldingByIdDocument } from '@queries'
import { LoadablePageHeader } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import NySykmeldingFormSkeleton from '@features/ny-sykmelding-form/NySykmeldingFormSkeleton'
import { useDiagnoseSuggestions } from '@features/ny-sykmelding-form/diagnose/useDiagnoseSuggestions'
import NySykmeldingForm from '@features/ny-sykmelding-form/NySykmeldingForm'
import { forlengSykmeldingDefaultValues } from '@features/actions/forleng-sykmelding/forleng-sykmelding-mappers'
import { SykmeldingFormErrors } from '@features/actions/common/SykmeldingFormErrors'

interface Props {
    sykmeldingId: string
}

function ForlengSykmelding({ sykmeldingId }: Props): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <NySykmeldingPageSteps
            heading={
                <LoadablePageHeader lead="Forleng sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />
            }
        >
            <ForlengSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPageSteps>
    )
}

function ForlengSykmeldingFormWithDefaultValues({ sykmeldingId }: { sykmeldingId: string }): ReactElement {
    const suggestionsQuery = useDiagnoseSuggestions()
    const sykmeldingQuery = useQuery(SykmeldingByIdDocument, {
        variables: { id: sykmeldingId },
    })

    if (suggestionsQuery.loading || sykmeldingQuery.loading) {
        return <NySykmeldingFormSkeleton />
    }

    if (sykmeldingQuery.data?.sykmelding == null) {
        return <SykmeldingFormErrors refetch={sykmeldingQuery.refetch} />
    }

    const [derivedDefaultValues, nextFom] = forlengSykmeldingDefaultValues(sykmeldingQuery.data.sykmelding)

    return (
        <NySykmeldingForm
            defaultValues={derivedDefaultValues}
            contextualErrors={{ diagnose: suggestionsQuery.suggestions.diagnose.error }}
            initialFom={nextFom}
        />
    )
}

export default ForlengSykmelding
