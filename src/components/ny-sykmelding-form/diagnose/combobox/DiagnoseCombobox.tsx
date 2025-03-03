import React, { ReactElement, startTransition } from 'react'
import { Alert, BodyShort, Button, Detail, ErrorMessage, Label } from '@navikt/ds-react'
import { useQuery } from '@tanstack/react-query'

import { pathWithBasePath } from '@utils/url'
import { cn } from '@utils/tw'
import { raise } from '@utils/ts'

import {
    AkselifiedCombobox,
    AkselifiedComboboxDisclosure,
    AkselifiedComboboxItem,
    AkselifiedComboboxLoading,
    AkselifiedComboboxNonInteractiveFeedbackItem,
    AkselifiedComboboxNonSelectables,
    AkselifiedComboboxPopover,
    AkselifiedComboboxWrapper,
    useComboboxStore,
    useStoreState,
} from './AkselifiedCombobox'

export type DiagnoseSystem = 'ICD10' | 'ICPC2'

export type DiagnoseSuggestion = { system: DiagnoseSystem; code: string; text: string }

interface Props {
    id?: string
    className?: string
    value: DiagnoseSuggestion | null
    label: string
    description?: string
    onSelect: (value: DiagnoseSuggestion) => void
    onChange: () => void
    onBlur: () => void
    error: string | undefined
}

function DiagnoseCombobox({
    id,
    className,
    value,
    label,
    description,
    onSelect,
    onChange,
    onBlur,
    error,
}: Props): ReactElement {
    const combobox = useComboboxStore({
        defaultValue: value ? createUniqueValue(value) : '',
        selectedValue: value ? createUniqueValue(value) : '',
        setSelectedValue: (value) => {
            const unwrappedValue = unwrapUniqueValue(value)
            const selectedSuggestion = suggestions.find(
                (it) =>
                    it.code.toLowerCase() === unwrappedValue.code.toLowerCase() &&
                    it.system.toLowerCase() === unwrappedValue.system.toLowerCase(),
            )

            if (selectedSuggestion == null) {
                raise("Illegal state: Selected suggestion doesn't match with cache")
            }

            onSelect(selectedSuggestion as DiagnoseSuggestion)

            document.getElementById('step-navigation-next')?.focus()
        },
        setValue: () => {
            startTransition(() => {
                onChange()
            })
        },
    })
    const state = useStoreState(combobox)
    const { isLoading, hasError, suggestions } = useSuggestions(state.value)

    return (
        <div>
            <div
                className={cn({
                    hidden: value != null,
                })}
            >
                <AkselifiedComboboxWrapper labelId={`${id}-label`} label={label} className={className} store={combobox}>
                    {description && <BodyShort className="navds-form-field__description">{description}</BodyShort>}
                    <AkselifiedCombobox
                        id={id}
                        aria-labelledby={`${id}-label`}
                        placeholder="Søk på kode eller beskrivelse"
                        onBlur={onBlur}
                        error={error}
                        autoFocus
                    >
                        <AkselifiedComboboxDisclosure loading={suggestions.length > 0 && isLoading} />
                    </AkselifiedCombobox>
                    <AkselifiedComboboxPopover>
                        <AkselifiedComboboxNonSelectables>
                            {suggestions.length === 0 && isLoading && <AkselifiedComboboxLoading />}
                            {(state.value.trim() === '' || (suggestions.length === 0 && !isLoading && !hasError)) && (
                                <AkselifiedComboboxNonInteractiveFeedbackItem>
                                    Søk på enten kode eller beskrivelse
                                </AkselifiedComboboxNonInteractiveFeedbackItem>
                            )}
                            {suggestions.length === 0 && !isLoading && state.value.trim() !== '' && !hasError && (
                                <AkselifiedComboboxNonInteractiveFeedbackItem>
                                    {`Fant ingen diagnose med kode eller beskrivelse "${state.value}"`}
                                </AkselifiedComboboxNonInteractiveFeedbackItem>
                            )}
                            {hasError && (
                                <Alert variant="error" className="border-none rounded-none">
                                    <BodyShort spacing>
                                        {`En feil skjedde ved søk etter diagnoser på "${state.value}"`}
                                    </BodyShort>
                                    <BodyShort>Vennligst prøv igjen senere.</BodyShort>
                                </Alert>
                            )}
                        </AkselifiedComboboxNonSelectables>
                        {state.value &&
                            suggestions.length > 0 &&
                            suggestions.map((value) => (
                                <AkselifiedComboboxItem
                                    key={`${value.code}-${value.system}`}
                                    value={createUniqueValue(value)}
                                >
                                    <div>
                                        <Label>{value.code}</Label>
                                        <Detail>{value.system}</Detail>
                                    </div>
                                    <Detail className="text-right break-words ml-2 max-w-48 overflow-hidden">
                                        {value.text}
                                    </Detail>
                                </AkselifiedComboboxItem>
                            ))}
                    </AkselifiedComboboxPopover>
                    {error && <ErrorMessage>{error}</ErrorMessage>}
                </AkselifiedComboboxWrapper>
            </div>
            {value != null && (
                <div className="flex justify-between">
                    <div>
                        <Label>{label}</Label>
                        <BodyShort>
                            {value.code} - {value.text}
                        </BodyShort>
                        <Detail spacing>{value.system}</Detail>
                    </div>
                    <div>
                        <Button
                            variant="secondary-neutral"
                            size="xsmall"
                            onClick={() => {
                                const resetValue = state.selectedValue
                                    ? unwrapUniqueValue(state.selectedValue).code
                                    : ''
                                combobox.setValue(resetValue)
                                onChange()
                            }}
                        >
                            Endre hoveddiagnose
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function useSuggestions(value: string): {
    isLoading: boolean
    hasError: boolean
    suggestions: DiagnoseSuggestion[]
} {
    const { data, isLoading, error } = useQuery({
        queryKey: ['diagnose-suggestions', value],
        queryFn: async () => {
            const response = await fetch(`${pathWithBasePath(`/api/diagnose/query?value=${value}`)}`)
            if (!response.ok) {
                throw new Error('Failed to fetch suggestions')
            }
            return response.json()
        },
    })

    const suggestions = data == null ? [] : 'reason' in data ? [] : data

    return { isLoading, hasError: error != null, suggestions }
}

function createUniqueValue(suggestion: DiagnoseSuggestion): string {
    return `${suggestion.code} - ${suggestion.system}`
}

function unwrapUniqueValue(value: string): Pick<DiagnoseSuggestion, 'code' | 'system'> {
    const [code, system] = value.split(' - ')

    return {
        system: system as DiagnoseSystem,
        code,
    }
}

export default DiagnoseCombobox
