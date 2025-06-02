import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import MainSection from '@components/ny-sykmelding-form/MainSection'
import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'
import { KonsultasjonDocument } from '@queries'

function MainSectionWithData(): ReactElement {
    const { loading, data, error } = useQuery(KonsultasjonDocument)

    if (loading) {
        return (
            // Needs a much better skeleton
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton width="100%" height={350} />
                <Skeleton width="100%" height={350} />
                <Skeleton width="100%" height={350} />
                <Skeleton width="100%" height={350} />
            </div>
        )
    }

    return (
        <MainSection
            initialServerValues={{
                diagnose: {
                    value: pickMostRelevantDiagnose(data?.konsultasjon?.diagnoser ?? null),
                    error: error ? { error: 'FHIR_FAILED' } : undefined,
                },
            }}
        />
    )
}

function pickMostRelevantDiagnose(
    // diagnoser: { system: 'ICD10' | 'ICPC2'; code: string; text: string }[] | null,
    diagnoser: { system: 'ICD10' | 'ICPC2'; code: string }[] | null,
): DiagnoseSuggestion | null {
    if (!diagnoser || diagnoser.length === 0) {
        return null
    }

    return diagnoser[0]
}

export default MainSectionWithData
