import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'

import { isSameDiagnose } from '@data-layer/common/diagnose'
import { SimpleReveal } from '@components/animation/Reveal'

import { useFormContext } from '../form/types'

import { useDiagnoseSuggestions } from './useDiagnoseSuggestions'

function DiagnoseInfoAlert(): ReactElement | null {
    const { watch } = useFormContext()
    const suggestionsQuery = useDiagnoseSuggestions()
    const formDiagnose = watch('diagnoser')

    if (suggestionsQuery.loading) return null

    const sameHovedDiagnose = isSameDiagnose(formDiagnose.hoved, suggestionsQuery.suggestions.diagnose.value)
    const allBiSame =
        formDiagnose.bidiagnoser.length === suggestionsQuery.suggestions.bidiagnoser?.length &&
        formDiagnose.bidiagnoser.every(
            (bi) => suggestionsQuery.suggestions.bidiagnoser?.some((it) => isSameDiagnose(bi, it)) ?? false,
        )

    return (
        <AnimatePresence>
            {!(sameHovedDiagnose && allBiSame) && (
                <SimpleReveal>
                    <Alert variant="info" className="mt-4">
                        <Heading size="small" level="4">
                            Diagnosen oppdateres ikke i EPJ
                        </Heading>
                        <BodyShort>
                            De valgte diagnosene samsvarer ikke med opplysningene i EPJ. Diagnosefeltet i EPJ vil ikke
                            bli oppdatert automatisk.
                        </BodyShort>
                    </Alert>
                </SimpleReveal>
            )}
        </AnimatePresence>
    )
}

export default DiagnoseInfoAlert
