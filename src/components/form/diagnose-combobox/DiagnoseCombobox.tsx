import React, { ReactElement, ReactNode, useState } from 'react'
import { BodyShort, Button, Detail, Label, UNSAFE_Combobox as Combobox } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import * as R from 'remeda'

import { Diagnose, DiagnoseSystem } from '@data-layer/common/diagnose'
import { DiagnoseFragment, DiagnoseSearchDocument } from '@queries'
import { raise } from '@lib/ts'
import { cn } from '@lib/tw'

import styles from './DiagnoseCombobox.module.css'

interface Props {
    id?: string
    className?: string
    value: Diagnose | null
    label: string
    description?: string
    onSelect: (value: Diagnose) => void
    onChange: () => void
    onBlur: () => void
    error: string | undefined
    actions?: ReactNode | null
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
    actions,
}: Props): ReactElement {
    const comboRef = React.useRef<HTMLInputElement>(null)
    const endreRef = React.useRef<HTMLButtonElement>(null)
    const [overwrite, setOverwrite] = useState(false)

    const [query, setQuery] = useState(value ? value.code : '')
    const { isLoading, hasError, suggestions } = useSuggestions(query)
    const serverSuggestionOptions = suggestions.map((it) => {
        return {
            label: `${it.text} - ${it.code} \n${it.system}`,
            value: createUniqueValue(it),
        }
    })

    const handleOnToggleSelected = (value: string): void => {
        const unwrappedValue = unwrapUniqueValue(value)
        const selectedSuggestion = suggestions.find(
            (it) =>
                it.code.toLowerCase() === unwrappedValue.code.toLowerCase() &&
                it.system.toLowerCase() === unwrappedValue.system.toLowerCase(),
        )

        if (selectedSuggestion == null) {
            raise("Illegal state: Selected suggestion doesn't match with cache")
        }

        onSelect(R.omit(selectedSuggestion, ['__typename']))
        setOverwrite(false)

        requestAnimationFrame(() => {
            endreRef.current?.focus()
        })
    }

    return (
        <fieldset className={cn('p-0', className)}>
            <legend className="sr-only">{label}</legend>
            {(value == null || overwrite) && (
                <Combobox
                    ref={comboRef}
                    id={id}
                    label={label}
                    description={description}
                    className={cn(styles.comboboxWrapper, className)}
                    value={query}
                    onChange={setQuery}
                    isLoading={isLoading}
                    isListOpen={!!query.trim() && query.length > 0}
                    error={hasError ? 'Klarte ikke å søke i diagnoser, prøv igjen senere' : error}
                    onBlur={onBlur}
                    filteredOptions={serverSuggestionOptions}
                    options={serverSuggestionOptions}
                    onToggleSelected={handleOnToggleSelected}
                    placeholder="Start å skrive for å søke etter diagnosekode"
                />
            )}
            {value != null && (
                <div className="flex justify-between">
                    <div>
                        <Label>{label}</Label>
                        <BodyShort>
                            {value.code} - {value.text}
                        </BodyShort>
                        <Detail spacing>{value.system}</Detail>
                    </div>
                    <div className="flex gap-2 items-start">
                        <Button
                            ref={endreRef}
                            data-color="neutral"
                            variant="secondary"
                            size="small"
                            type="button"
                            onClick={() => {
                                setQuery(value?.code)
                                setOverwrite(true)
                                onChange()

                                requestAnimationFrame(() => {
                                    comboRef.current?.focus()
                                })
                            }}
                        >
                            Endre
                        </Button>
                        {actions}
                    </div>
                </div>
            )}
        </fieldset>
    )
}

function useSuggestions(value: string): {
    isLoading: boolean
    hasError: boolean
    suggestions: DiagnoseFragment[]
} {
    const { data, loading, error } = useQuery(DiagnoseSearchDocument, {
        variables: { query: value },
        skip: !value || value.trim() === '',
    })

    const suggestions: DiagnoseFragment[] = data == null ? [] : (data.diagnose ?? [])

    return { isLoading: loading, hasError: error != null, suggestions }
}

function createUniqueValue(suggestion: Diagnose): string {
    return `${suggestion.code} - ${suggestion.system}`
}

function unwrapUniqueValue(value: string): Pick<Diagnose, 'code' | 'system'> {
    const [code, system] = value.split(' - ')

    return {
        system: system as DiagnoseSystem,
        code,
    }
}

export default DiagnoseCombobox
