import React, { ReactElement } from 'react'
import { BodyShort, Button, InfoCard } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'
import { InformationSquareIcon } from '@navikt/aksel-icons'

import { Diagnose, isSameDiagnose } from '@data-layer/common/diagnose'
import { SimpleReveal } from '@components/animation/Reveal'

import { useFormContext } from '../form/types'

import { useDiagnoseSuggestions } from './useDiagnoseSuggestions'

function DiagnoseInfoAlert(): ReactElement | null {
    const { watch, setValue } = useFormContext()
    const suggestionsQuery = useDiagnoseSuggestions()
    const formDiagnose = watch('diagnoser')

    if (suggestionsQuery.loading) return null

    const sameHovedDiagnose = isSameDiagnose(formDiagnose.hoved, suggestionsQuery.suggestions.diagnose.value)
    const allBiSame =
        formDiagnose.bidiagnoser.length === suggestionsQuery.suggestions.bidiagnoser?.length &&
        formDiagnose.bidiagnoser.every(
            (bi) => suggestionsQuery.suggestions.bidiagnoser?.some((it) => isSameDiagnose(bi, it)) ?? false,
        )
    const zeroFromEpj =
        suggestionsQuery.suggestions.diagnose.value == null &&
        (suggestionsQuery.suggestions.bidiagnoser == null || suggestionsQuery.suggestions.bidiagnoser?.length === 0)

    return (
        <AnimatePresence>
            {!zeroFromEpj && !(sameHovedDiagnose && allBiSame) && (
                <SimpleReveal>
                    <InfoCard data-color="info" className="mt-4" size="small">
                        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                            <InfoCard.Title>Diagnosen oppdateres ikke i EPJ</InfoCard.Title>
                        </InfoCard.Header>
                        <InfoCard.Content>
                            <BodyShort>
                                De valgte diagnosene samsvarer ikke med opplysningene i EPJ. Diagnosefeltet i EPJ vil
                                ikke bli oppdatert automatisk.
                            </BodyShort>
                            <Button
                                data-color="neutral"
                                variant="secondary"
                                size="small"
                                className="mt-4"
                                type="button"
                                onClick={() => {
                                    const hoved = suggestionsQuery.suggestions?.diagnose.value
                                    const bidiagnoser = suggestionsQuery.suggestions?.bidiagnoser ?? []

                                    if (hoved) {
                                        setValue('diagnoser.hoved', {
                                            code: hoved.code,
                                            system: hoved.system,
                                            text: hoved.text,
                                        } satisfies Diagnose)
                                    }

                                    if (bidiagnoser.length === 0) {
                                        setValue('diagnoser.bidiagnoser', [])
                                    } else {
                                        setValue(
                                            'diagnoser.bidiagnoser',
                                            bidiagnoser.map((bi) => ({
                                                code: bi.code,
                                                system: bi.system,
                                                text: bi.text,
                                            })) satisfies Diagnose[],
                                        )
                                    }
                                }}
                            >
                                Bruk diagnoser fra EPJ
                            </Button>
                        </InfoCard.Content>
                    </InfoCard>
                </SimpleReveal>
            )}
        </AnimatePresence>
    )
}

export default DiagnoseInfoAlert
