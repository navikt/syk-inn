import React, { PropsWithChildren, ReactElement, useEffect, useMemo } from 'react'
import { DefaultValues, useForm } from 'react-hook-form'
import { BodyShort, Heading, Skeleton } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'
import { raise } from '@utils/ts'

import { StepNavigation } from '../steps/StepNavigation'
import { DiagnoseStep, nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'
import { useAppDispatch, useAppSelector } from '../../../providers/redux/hooks'
import { useFormStep } from '../steps/useFormStep'
import { KonsultasjonInfo } from '../../../data-fetcher/data-service'
import { useContextKonsultasjon } from '../../../data-fetcher/hooks/use-context-konsultasjon'

import DiagnosePicker from './DiagnosePicker'

export type DiagnoseFormValues = {
    hoved: DiagnoseSuggestion | null
    bi: DiagnoseSuggestion[]
}

function DiagnoseSection(): ReactElement {
    const { data, isLoading, error } = useContextKonsultasjon()

    return (
        <div className="mt-8">
            {!isLoading ? (
                <DiagnoseSectionWithData suggestions={data}>
                    {error && (
                        <BodyShort className="mt-2 flex gap-1 items-center">
                            <ExclamationmarkTriangleIcon aria-hidden />
                            Kunne ikke hente diagnoser, du kan fortsatt velge diagnosen manuelt.
                        </BodyShort>
                    )}
                </DiagnoseSectionWithData>
            ) : (
                <DiagnoseSectionSkeleton />
            )}
        </div>
    )
}

interface DiagnoseSectionWithDataProps {
    suggestions?: KonsultasjonInfo | undefined
}

function DiagnoseSectionWithData({
    suggestions,
    children,
}: PropsWithChildren<DiagnoseSectionWithDataProps>): ReactElement {
    const [, setStep] = useFormStep()
    const dispatch = useAppDispatch()
    const existingStep = useAppSelector((state) => state.nySykmeldingMultistep.diagnose)
    const defaultValues = useMemo(() => createDefaultValues(suggestions, existingStep), [existingStep, suggestions])
    const form = useForm<DiagnoseFormValues>({
        defaultValues: defaultValues,
    })

    useEffect(() => {
        const wasPrefilled = defaultValues.hoved != null

        if (wasPrefilled) {
            setTimeout(() => {
                document.getElementById('step-navigation-next')?.focus()
            }, 10)
        }
    }, [defaultValues.hoved])

    return (
        <section aria-labelledby="diagnose-section-heading">
            <Heading level="3" size="small" id="diagnose-section-heading">
                Diagnose
            </Heading>
            <form
                onSubmit={form.handleSubmit((values) => {
                    dispatch(
                        nySykmeldingMultistepActions.completeDiagnose({
                            hoved: values.hoved ?? raise('Submit without hoveddiagnose'),
                            bi: [],
                        }),
                    )
                    setStep(3)
                })}
            >
                <DiagnosePicker control={form.control} suggestedDiagnoser={suggestions?.diagnoser ?? null} />
                {children}
                <StepNavigation previous={2} />
            </form>
        </section>
    )
}

function createDefaultValues(
    suggestions: KonsultasjonInfo | undefined,
    existingStep: DiagnoseStep | null,
): DefaultValues<DiagnoseFormValues> {
    if (existingStep != null) {
        return {
            hoved: existingStep.hoved,
            bi: existingStep.bi,
        }
    }

    if (suggestions == null || suggestions.diagnoser.length === 0) {
        return {}
    }

    const [first] = suggestions.diagnoser
    return {
        hoved: {
            code: first.kode,
            system: first.system,
            text: first.tekst,
        },
        bi: [],
    }
}

function DiagnoseSectionSkeleton(): ReactElement {
    return (
        <div>
            <Skeleton width="40%" />
            <Skeleton variant="rectangle" className="mt-2" height={48} />
            <Skeleton width="50%" className="mt-3" />
            <div className="flex gap-3 mt-2">
                <Skeleton variant="rectangle" height={32} width={128} />
                <Skeleton variant="rectangle" height={32} width={128} />
            </div>
        </div>
    )
}

export default DiagnoseSection
